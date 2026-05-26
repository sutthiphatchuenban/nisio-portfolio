import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { prompt, template } = body

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const ipAddress = typeof ip === 'string' ? ip.split(',')[0].trim() : ip[0]

        const isLocal = ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.includes('127.0.0.1') || process.env.NODE_ENV === 'development'

        if (ipAddress !== 'unknown' && !isLocal) {
            // Check limit
            const limit = await prisma.aiGenerationLimit.findUnique({
                where: { ipAddress }
            })

            if (limit && limit.count >= 3) {
                return NextResponse.json({ error: 'You have reached the limit of 3 generations.' }, { status: 429 })
            }

            // Charge for the attempt immediately (rate limit protection)
            await prisma.aiGenerationLimit.upsert({
                where: { ipAddress },
                update: { count: { increment: 1 } },
                create: { ipAddress, count: 1 }
            })
        }

        // Call NVIDIA AI API
        const apiKey = process.env.NVIDIA_API_KEY
        if (!apiKey) {
            console.error('NVIDIA_API_KEY is not set')
            return NextResponse.json({ error: 'NVIDIA API key not configured on server' }, { status: 500 })
        }

        const systemPrompt = `You are a world-class award-winning frontend developer and web designer.
Generate a single, complete, beautiful, and self-contained HTML page based on the user's prompt and selected template style.

Rules:
1. The page MUST be self-contained: include all styles, JavaScript, and structure in one single file.
2. Use Tailwind CSS via the CDN script: <script src="https://cdn.tailwindcss.com"></script>.
3. Include modern font family via Google Fonts (like Prompt or Inter or Outfit) and set it as default in Tailwind config or inline style.
4. Implement interactive features where appropriate using vanilla JavaScript (e.g. mobile menu toggle, tab switching, form submission alert, hover effects, modal pops).
5. The layout must be highly polished, premium, modern, and fully responsive (mobile-first). Avoid plain white or unstyled blocks. Use harmonious color palettes.
6. Use inline SVGs for icons. Do NOT use external icon libraries.
7. Return ONLY the HTML code. Do NOT wrap the output in markdown code blocks like \`\`\`html ... \`\`\` or include any conversational intro/outro text. Start directly with <!DOCTYPE html>.
8. CRITICAL: The page MUST be COMPLETE. Always close every HTML tag. Always include </body></html> at the end. Keep the page to 3-5 sections maximum to ensure it fits completely. Never leave the code unfinished.
9. Prefer concise, elegant implementations. Avoid extremely long repeated markup. Quality over quantity.
10. LINE LIMIT: The total HTML output MUST NOT exceed 250 lines in length. Keep the markup, inline CSS, and JavaScript clean and compact to fit within this 250-line limit.
11. IMAGES: Always use high-quality, specific, and relevant Unsplash image URLs (e.g. starting with \`https://images.unsplash.com/photo-...\` with parameters like \`?auto=format&fit=crop&w=800&q=80\`) for any image or avatar tags. Choose photos that precisely match the theme of the requested website. Never use broken paths, local files, or blank colored blocks.
12. LANDING PAGE FORMAT: Structure the entire document strictly as a single-page landing page containing: a navigation bar, a hero section (headline, CTAs, hero image), a service/feature grid, a call-to-action (CTA) section (or contact form), and a footer. Ensure it flows logically as one complete page.`;

        const userPrompt = `Template Style Chosen: ${template || 'Modern SaaS'}
User Prompt / Website Description: ${prompt}

Create a gorgeous, fully functioning frontend web page according to this description. Make sure it feels alive with micro-interactions, smooth transitions, and a premium look. IMPORTANT: The page must be COMPLETE — always end with closing </body></html> tags. Keep the page to 3-5 key sections to ensure completeness.`;

        const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            },
            body: JSON.stringify({
                model: "qwen/qwen3.5-122b-a10b",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                max_tokens: 6144,
                temperature: 0.6,
                top_p: 0.95,
                stream: true
            })
        })

        if (!response.ok) {
            const errData = await response.text()
            console.error('NVIDIA API Error:', errData)
            return NextResponse.json({ error: 'AI generation service failed. Please try again later.' }, { status: 502 })
        }

        const reader = response.body?.getReader()
        if (!reader) {
            return NextResponse.json({ error: 'Failed to read response stream from AI service.' }, { status: 500 })
        }

        const decoder = new TextDecoder()
        let htmlCode = ""
        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split("\n")
            buffer = lines.pop() || ""

            for (const line of lines) {
                const cleanedLine = line.trim()
                if (!cleanedLine) continue
                if (cleanedLine === "data: [DONE]") continue

                if (cleanedLine.startsWith("data: ")) {
                    try {
                        const jsonStr = cleanedLine.slice(6)
                        const parsed = JSON.parse(jsonStr)
                        const chunk = parsed.choices?.[0]?.delta?.content || ""
                        htmlCode += chunk
                    } catch (e) {
                        // ignore parse errors for incomplete JSON lines
                    }
                }
            }
        }

        // Clean up markdown wrapping helper
        const cleanHtml = (code: string) => {
            let res = code.trim()
            if (res.startsWith("```html")) {
                res = res.substring(7)
            } else if (res.startsWith("```")) {
                res = res.substring(3)
            }
            if (res.endsWith("```")) {
                res = res.substring(0, res.length - 3)
            }
            return res.trim()
        }

        htmlCode = cleanHtml(htmlCode)

        let isComplete = htmlCode.toLowerCase().endsWith("</html>") || htmlCode.toLowerCase().includes("</html>")
        let attempts = 0
        const maxAttempts = 2

        const conversationMessages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
            { role: "assistant", content: htmlCode }
        ]

        while (!isComplete && attempts < maxAttempts) {
            attempts++
            console.log(`HTML truncated. Attempting continuation ${attempts}...`)
            
            const continuePrompt = `[SYSTEM: Your previous HTML output was truncated. Continue generating the rest of the HTML code EXACTLY from where you left off. Do NOT repeat the code already written. Start directly with the next characters of the HTML page, and ensure you finish it with </body></html>.]`
            
            conversationMessages.push({ role: "user", content: continuePrompt })

            const continueResponse = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    model: "qwen/qwen3.5-122b-a10b",
                    messages: conversationMessages,
                    max_tokens: 3072,
                    temperature: 0.4,
                    top_p: 0.95,
                    stream: true
                })
            })

            if (!continueResponse.ok) {
                console.error("Continuation API failed")
                break
            }

            const contReader = continueResponse.body?.getReader()
            if (!contReader) break

            let contChunk = ""
            let contBuffer = ""

            while (true) {
                const { done, value } = await contReader.read()
                if (done) break

                contBuffer += decoder.decode(value, { stream: true })
                const lines = contBuffer.split("\n")
                contBuffer = lines.pop() || ""

                for (const line of lines) {
                    const cleanedLine = line.trim()
                    if (!cleanedLine) continue
                    if (cleanedLine === "data: [DONE]") continue

                    if (cleanedLine.startsWith("data: ")) {
                        try {
                            const jsonStr = cleanedLine.slice(6)
                            const parsed = JSON.parse(jsonStr)
                            const chunk = parsed.choices?.[0]?.delta?.content || ""
                            contChunk += chunk
                        } catch (e) {
                            // ignore parse errors
                        }
                    }
                }
            }

            const cleanCont = cleanHtml(contChunk)
            htmlCode += cleanCont
            conversationMessages.push({ role: "assistant", content: contChunk })

            isComplete = htmlCode.toLowerCase().endsWith("</html>") || htmlCode.toLowerCase().includes("</html>")
        }

        if (!htmlCode) {
            return NextResponse.json({ error: 'AI returned empty code.' }, { status: 500 })
        }

        return NextResponse.json({ html: htmlCode })
    } catch (error: any) {
        console.error('Error generating AI code:', error)
        return NextResponse.json({ 
            error: 'Internal server error',
            details: error?.message || String(error),
            stack: error?.stack,
            cause: error?.cause?.message || error?.cause
        }, { status: 500 })
    }
}
