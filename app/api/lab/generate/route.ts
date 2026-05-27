import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { prompt, template, model } = body

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

        // Call Selected AI Provider API
        const isGemini = model?.startsWith("gemini")
        const apiKey = isGemini ? process.env.GEMINI_API_KEY : process.env.NVIDIA_API_KEY
        if (!apiKey) {
            console.error(isGemini ? 'GEMINI_API_KEY is not set' : 'NVIDIA_API_KEY is not set')
            return NextResponse.json({ error: `${isGemini ? 'Gemini' : 'NVIDIA'} API key not configured on server` }, { status: 500 })
        }

        const apiUrl = isGemini 
            ? "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" 
            : "https://integrate.api.nvidia.com/v1/chat/completions"

        let templateSpecificPrompt = ""
        if (template === "Modern SaaS") {
            templateSpecificPrompt = `
STYLE GUIDE FOR "Modern SaaS" TEMPLATE:
- Background: Strict deep dark mode (e.g. \`bg-slate-950\` or \`bg-[#030712]\`).
- Pre-defined CSS Classes:
  * Use \`glass-panel\` class for semi-transparent backdrop blur cards/containers.
  * Use \`gradient-text\` class on key words in headlines to apply a gorgeous indigo-purple-pink text gradient.
  * Place empty absolute divs with \`ambient-glow\` class to create glowing blurred background circles.
  * Use \`hover-scale\` and \`transition-premium\` for interactive buttons and card containers.
- Visuals: Use sleek cards, grid layouts, and clean flex lists.`
        } else if (template === "Cyberpunk Retro") {
            templateSpecificPrompt = `
STYLE GUIDE FOR "Cyberpunk Retro" TEMPLATE:
- Background: Pure solid black (\`bg-black\` or \`bg-slate-950\`).
- Accents & Colors: Neon cyan, neon pink, and bright yellow.
- Pre-defined CSS Classes:
  * Apply \`cyber-grid\` class on background wrappers to overlay scanlines and cyber pixelation.
  * Use \`neon-border\` (cyan glow) and \`neon-border-pink\` (pink glow) classes for cards and buttons.
  * Use \`neon-text\` (cyan text glow) and \`neon-text-pink\` (pink text glow) classes for titles and highlights.
  * Use monospace typography.
- Design Elements: Grid lines, heavy cyber borders, and technical UI details.`
        } else if (template === "Glassmorphism") {
            templateSpecificPrompt = `
STYLE GUIDE FOR "Glassmorphism" TEMPLATE:
- Background: Pure glass overlays. You MUST include background decorative absolute divs with classes \`bg-blob-1 w-[300px] h-[300px] top-10 left-10\` and \`bg-blob-2 w-[400px] h-[400px] bottom-10 right-10\` to create organic background glowing blobs.
- Pre-defined CSS Classes:
  * Use \`glass-card\` (light frosted panel) or \`glass-card-dark\` (dark frosted panel) for all card elements and sections.
  * Use \`hover-scale\` and \`transition-premium\` for buttons and card actions.
- Textures: Thin minimal borders, soft rounded edges (\`rounded-2xl\` or \`rounded-3xl\`), clean readable text.`
        } else if (template === "Minimalist Blog") {
            templateSpecificPrompt = `
STYLE GUIDE FOR "Minimalist Blog / Clean Developer" TEMPLATE:
- Background: Clean light mode (pure white \`bg-white\` or soft beige \`bg-slate-50\`) with a modern dark mode support.
- Pre-defined CSS Classes:
  * Use \`hover-line\` class on menu links and article headings to create a modern growing underline effect on hover.
  * Use clean high white-space padding (\`py-12\` or \`py-16\`), thin border lines (\`border-slate-200\`), and elegant typography.
- Accent color: Minimalist accent (e.g. emerald-600, or a simple sharp indigo-600).`
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
9. ${isGemini 
    ? "Prefer highly detailed, fully fleshed-out, and elegant implementations. Make the page rich in content and visual elements." 
    : "Prefer concise, elegant implementations. Avoid extremely long repeated markup. Quality over quantity."}
10. LINE LIMIT: ${isGemini 
    ? "The total HTML output should be rich and comprehensive, up to 350 lines in length. Do not compress or shorten the code unnecessarily." 
    : "The total HTML output MUST NOT exceed 180 lines in length. Write structurally compact HTML: put simple inline elements, SVGs, lists, and button elements on a single line instead of wrapping them across multiple lines. Avoid redundant line breaks."}
11. IMAGES: Always use high-quality, specific, and relevant Unsplash image URLs (e.g. starting with \`https://images.unsplash.com/photo-...\` with parameters like \`?auto=format&fit=crop&w=800&q=80\`) for any image or avatar tags. Choose photos that precisely match the theme of the requested website. Never use broken paths, local files, or blank colored blocks.
12. LANDING PAGE FORMAT: Structure the entire document strictly as a single-page landing page containing: a navigation bar, a hero section (headline, CTAs, hero image), a service/feature grid, a call-to-action (CTA) section (or contact form), and a footer. Ensure it flows logically as one complete page.
13. NO REACT/JSX/ES6 TEMPLATE STRINGS: Do NOT write React/JSX components or loops (e.g. '{[...].map()}' or '\${var}') in the HTML body. The HTML body must contain ONLY valid, raw, static HTML. Duplicate card/list items manually if needed instead of using JSX loops or template interpolation in the body.

${templateSpecificPrompt}`;

        const userPrompt = `Template Style Chosen: ${template || 'Modern SaaS'}
User Prompt / Website Description: ${prompt}

Create a gorgeous, fully functioning frontend web page according to this description. Make sure it feels alive with micro-interactions, smooth transitions, and a premium look. IMPORTANT: The page must be COMPLETE — always end with closing </body></html> tags. Keep the page to 3-5 key sections to ensure completeness.`;

        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "Accept": "text/event-stream"
            },
            body: JSON.stringify({
                model: model || "qwen/qwen3.5-122b-a10b",
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

            const continueResponse = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream"
                },
                body: JSON.stringify({
                    model: model || "qwen/qwen3.5-122b-a10b",
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

        // Post-process the generated HTML to ensure visual premium aesthetics and working Unsplash images
        htmlCode = replacePlaceholders(htmlCode, prompt, template)
        htmlCode = injectAesthetics(htmlCode, template)

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

// ── IMAGE PROCESSING POOL & HELPERS ──
const imagePool = {
    tech: [
        "photo-1518770660439-4636190af475",
        "photo-1498050108023-c5249f4df085",
        "photo-1460925895917-afdab827c52f",
        "photo-1526374965328-7f61d4dc18c5",
        "photo-1550751827-4bd374c3f58b",
        "photo-1451187580459-43490279c0fa"
    ],
    business: [
        "photo-1486406146926-c627a92ad1ab",
        "photo-1497366216548-37526070297c",
        "photo-1522071820081-009f0129c71c",
        "photo-1507679799987-c73779587ccf",
        "photo-1454165804606-c3d57bc86b40",
        "photo-1491336477066-31156b5e4f35"
    ],
    creative: [
        "photo-1501504905252-473c47e087f8",
        "photo-1513542789411-b6a5d4f31634",
        "photo-1459749411175-04bf5292ceea",
        "photo-1542291026-7eec264c27ff",
        "photo-1506744038136-46273834b3fb",
        "photo-1511512578047-dfb367046420"
    ],
    wellness: [
        "photo-1544367567-0f2fcb009e0b",
        "photo-1517838277536-f5f99be501cd",
        "photo-1571019613454-1cb2f99b2d8b",
        "photo-1506126613408-eca07ce68773",
        "photo-1505751172876-fa1923c5c528",
        "photo-1576091160550-2173dba999ef"
    ],
    food: [
        "photo-1504674900247-0877df9cc836",
        "photo-1554118811-1e0d58224f24",
        "photo-1498837167922-ddd27525d352",
        "photo-1447078806655-40579c2520d6",
        "photo-1495474472287-4d71bcdd2085",
        "photo-1512621776951-a57141f2eefd"
    ],
    travel: [
        "photo-1507525428034-b723cf961d3e",
        "photo-1469854523086-cc02fe5d8800",
        "photo-1566073771259-6a8506099945",
        "photo-1501785888041-af3ef285b470",
        "photo-1476514525535-07fb3b4ae5f1",
        "photo-1488646953014-85cb44e25828"
    ],
    blog: [
        "photo-1499750310107-5fef28a66643",
        "photo-1488190211105-8b0e65b80b4e",
        "photo-1516321318423-f06f85e504b3",
        "photo-1456513080510-7bf3a84b82f8",
        "photo-1457369804613-52c61a468e7d",
        "photo-1506784983877-45594efa4cbe"
    ],
    avatars: [
        "photo-1534528741775-53994a69daeb",
        "photo-1507003211169-0a1dd7228f2d",
        "photo-1539571696357-5a69c17a67c6",
        "photo-1494790108377-be9c29b29330",
        "photo-1500648767791-00dcc994a43e",
        "photo-1544005313-94ddf0286df2",
        "photo-1527980965255-d3b416303d12",
        "photo-1580489944761-15a19d654956"
    ]
}

function replacePlaceholders(html: string, prompt: string, template: string): string {
    const promptLower = prompt.toLowerCase()
    let category: keyof typeof imagePool = 'blog'

    if (/\b(app|saas|software|dashboard|ai|robot|tech|code|developer|digital|cyber|network|mobile|phone|computer)\b/i.test(promptLower)) {
        category = 'tech'
    } else if (/\b(agency|business|corporate|marketing|consulting|finance|money|bank|legal|law|investment)\b/i.test(promptLower)) {
        category = 'business'
    } else if (/\b(creative|design|art|portfolio|photo|music|studio|fashion|gallery|artist|paint)\b/i.test(promptLower)) {
        category = 'creative'
    } else if (/\b(gym|fit|health|wellness|yoga|med|doctor|dentist|clinic|sport|workout|physio)\b/i.test(promptLower)) {
        category = 'wellness'
    } else if (/\b(food|cafe|restaurant|coffee|bake|drink|chef|kitchen|bar|dining|cater)\b/i.test(promptLower)) {
        category = 'food'
    } else if (/\b(travel|hotel|resort|trip|tour|nature|beach|mountain|camp|flight)\b/i.test(promptLower)) {
        category = 'travel'
    }

    const categoryPhotos = imagePool[category]
    const avatars = imagePool.avatars

    let generalIndex = 0
    let avatarIndex = 0

    // Replace img tags src
    let updatedHtml = html.replace(/<img\s+([^>]*?)src=["']([^"']*)["']([^>]*?)>/gi, (match, prefix, src, suffix) => {
        // If it's already a valid unsplash URL and NOT a placeholder/empty, keep it
        const isPlaceholder = !src || src.includes('placeholder') || src.includes('placehold') || src.includes('example.com') || src.includes('dummyimage') || !src.startsWith('http')
        
        if (!isPlaceholder) {
            return match
        }

        const isAvatar = /avatar|profile|user|testimonial|customer|client|founder|ceo|author|rounded-full|\bw-\d{1,2}\b|\bh-\d{1,2}\b/i.test(match + src)
        
        if (isAvatar) {
            const photoId = avatars[avatarIndex % avatars.length]
            avatarIndex++
            const newSrc = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=150&h=150&q=80`
            const cleanPrefix = prefix.trim() ? prefix.trim() + " " : ""
            const cleanSuffix = suffix.trim() ? " " + suffix.trim() : ""
            return `<img ${cleanPrefix}src="${newSrc}"${cleanSuffix}>`
        } else {
            const photoId = categoryPhotos[generalIndex % categoryPhotos.length]
            generalIndex++
            const newSrc = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`
            const cleanPrefix = prefix.trim() ? prefix.trim() + " " : ""
            const cleanSuffix = suffix.trim() ? " " + suffix.trim() : ""
            return `<img ${cleanPrefix}src="${newSrc}"${cleanSuffix}>`
        }
    })

    // Replace inline style or Tailwind background-image placeholders
    updatedHtml = updatedHtml.replace(/url\(['"]?([^'")\s]+)['"]?\)/gi, (match, url) => {
        const isPlaceholder = !url || url.includes('placeholder') || url.includes('placehold') || url.includes('example.com') || url.includes('dummyimage') || !url.startsWith('http')
        if (isPlaceholder) {
            const photoId = categoryPhotos[generalIndex % categoryPhotos.length]
            generalIndex++
            return `url('https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80')`
        }
        return match
    })

    return updatedHtml
}

function injectAesthetics(html: string, template: string): string {
    const fontLink = '<link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">';
    
    let templateCss = "";
    if (template === "Modern SaaS") {
        templateCss = `
        body {
            font-family: 'Outfit', 'Inter', 'Prompt', sans-serif;
            scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #030712;
        }
        ::-webkit-scrollbar-thumb {
            background: #1f2937;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #374151;
        }
        .ambient-glow {
            position: absolute;
            width: 500px;
            height: 500px;
            border-radius: 9999px;
            background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.05) 50%, rgba(0,0,0,0) 100%);
            filter: blur(60px);
            pointer-events: none;
            z-index: 0;
            animation: floatGlow 20s infinite alternate;
        }
        @keyframes floatGlow {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, 30px) scale(1.1); }
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gradient-text {
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        `;
    } else if (template === "Cyberpunk Retro") {
        templateCss = `
        body {
            font-family: 'Space Grotesk', 'Prompt', sans-serif;
            scroll-behavior: smooth;
            background-color: #000;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #000;
        }
        ::-webkit-scrollbar-thumb {
            background: #ec4899;
            border-radius: 0px;
        }
        .neon-border {
            box-shadow: 0 0 10px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(34, 211, 238, 0.1);
            border: 1px solid rgba(34, 211, 238, 0.6);
        }
        .neon-border-pink {
            box-shadow: 0 0 10px rgba(236, 72, 153, 0.3), inset 0 0 10px rgba(236, 72, 153, 0.1);
            border: 1px solid rgba(236, 72, 153, 0.6);
        }
        .neon-text {
            text-shadow: 0 0 5px rgba(34, 211, 238, 0.8), 0 0 10px rgba(34, 211, 238, 0.4);
        }
        .neon-text-pink {
            text-shadow: 0 0 5px rgba(236, 72, 153, 0.8), 0 0 10px rgba(236, 72, 153, 0.4);
        }
        .cyber-grid {
            background-image: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
            background-size: 100% 4px, 6px 100%;
        }
        `;
    } else if (template === "Glassmorphism") {
        templateCss = `
        body {
            font-family: 'Outfit', 'Inter', 'Prompt', sans-serif;
            scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.05);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 4px;
        }
        .glass-card {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
        }
        .glass-card-dark {
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
        }
        .bg-blob-1 {
            position: absolute;
            background: #ec4899;
            filter: blur(120px);
            opacity: 0.35;
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
        }
        .bg-blob-2 {
            position: absolute;
            background: #3b82f6;
            filter: blur(120px);
            opacity: 0.35;
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
        }
        `;
    } else if (template === "Minimalist Blog") {
        templateCss = `
        body {
            font-family: 'Inter', 'Prompt', sans-serif;
            scroll-behavior: smooth;
        }
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e2e8f0;
            border-radius: 3px;
        }
        .hover-line {
            position: relative;
        }
        .hover-line::after {
            content: '';
            position: absolute;
            width: 100%;
            transform: scaleX(0);
            height: 1px;
            bottom: -2px;
            left: 0;
            background-color: currentColor;
            transform-origin: bottom right;
            transition: transform 0.25s ease-out;
        }
        .hover-line:hover::after {
            transform: scaleX(1);
            transform-origin: bottom left;
        }
        `;
    }

    const cssBlock = `
    <!-- INJECTED PREMIUM STYLING BY PLAYGROUND SANDBOX -->
    ${fontLink}
    <style>
        ${templateCss}
        
        .transition-premium {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale {
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-scale:hover {
            transform: scale(1.02);
        }
    </style>
    `;

    if (html.includes("</head>")) {
        return html.replace("</head>", () => `${cssBlock}\n</head>`);
    } else if (html.includes("<head>")) {
        return html.replace("<head>", () => `<head>\n${cssBlock}`);
    } else if (html.includes("<body>")) {
        return html.replace("<body>", () => `<head>\n${cssBlock}\n</head>\n<body>`);
    }
    
    return cssBlock + html;
}
