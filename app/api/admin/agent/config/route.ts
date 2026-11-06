import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { encrypt, getAgentConfig, validateEndpoint } from "@/lib/agent-config"

export const dynamic = "force-dynamic"
export async function GET() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const config = await getAgentConfig()
        return NextResponse.json({ baseUrl: config?.base_url || "", model: config?.model || "", hasKey: !!config?.encrypted_key, hasSearchKey: !!config?.encrypted_search_key, apiFormat: config?.api_format || "chat", instructions: config?.instructions || "", maxSteps: config?.max_steps || 6, modelOptions: config?.model_options || {} })
    } catch { return NextResponse.json({ error: "Agent storage unavailable; apply the database migration" }, { status: 503 }) }
}
export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    try {
        const body = await request.json()
        if (typeof body.baseUrl !== "string" || typeof body.model !== "string" || !body.model.trim() || body.model.length > 200 || (body.apiKey !== undefined && typeof body.apiKey !== "string")) return NextResponse.json({ error: "Invalid settings" }, { status: 400 })
        const optionsSchema = z.object({contextWindow:z.number().int().min(256).max(10000000).nullable(),maxOutputTokens:z.number().int().min(1).max(1000000).nullable(),imageInput:z.boolean(),videoInput:z.boolean().default(false),pdfInput:z.boolean().default(false),outputParameter:z.enum(["max_tokens","max_completion_tokens"]).default("max_tokens"),structuredOutput:z.boolean().default(false),nativeWebSearch:z.boolean().default(false),midSystemMessages:z.boolean().default(false),reasoningLevels:z.array(z.string().max(50)).max(20).default([]),reasoningLevel:z.string().max(50),reasoningMapping:z.record(z.string(),z.unknown()).refine(value=>Object.keys(value).every(key=>["reasoning_effort","reasoning","thinking","output_config"].includes(key)),"Unsupported reasoning parameter")}).strict()
        const options = optionsSchema.parse(body.modelOptions || {contextWindow:null,maxOutputTokens:null,imageInput:true,reasoningLevel:"",reasoningMapping:{}})
        const optionsJson = JSON.stringify(options)
        const apiFormat = body.apiFormat || "chat"
        const instructions = typeof body.instructions === "string" ? body.instructions.trim() : ""
        const maxSteps = body.maxSteps === undefined ? 6 : body.maxSteps
        if (instructions.length > 4000 || !Number.isInteger(maxSteps) || maxSteps < 1 || maxSteps > 12) return NextResponse.json({error:"Invalid agent behavior settings"},{status:400})
        if (!["chat", "responses", "anthropic"].includes(apiFormat)) return NextResponse.json({error:"Unsupported API format"},{status:400})
        const baseUrl = await validateEndpoint(body.baseUrl)
        if (options.nativeWebSearch && apiFormat === "chat" && new URL(baseUrl).hostname !== "openrouter.ai") return NextResponse.json({error:"Native web search for Chat Completions currently requires OpenRouter"},{status:400})
        const old = await getAgentConfig()
        if (old && old.base_url !== baseUrl && !body.apiKey) return NextResponse.json({ error: "กรุณาใส่ API key ใหม่เมื่อเปลี่ยน Base URL" }, { status: 400 })
        const encryptedKey = body.apiKey ? encrypt(body.apiKey) : old?.encrypted_key
        if (body.searchKey !== undefined && typeof body.searchKey !== "string") return NextResponse.json({ error:"Invalid search key" }, {status:400})
        const encryptedSearchKey = body.searchKey ? encrypt(body.searchKey) : old?.encrypted_search_key || null
        if (!encryptedKey) return NextResponse.json({ error: "API key is required" }, { status: 400 })
        await prisma.$executeRaw`INSERT INTO agent_config (id, base_url, model, encrypted_key, encrypted_search_key, api_format, instructions, max_steps, model_options, updated_at) VALUES ('default', ${baseUrl}, ${body.model.trim()}, ${encryptedKey}, ${encryptedSearchKey}, ${apiFormat}, ${instructions}, ${maxSteps}, ${optionsJson}::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET base_url = EXCLUDED.base_url, model = EXCLUDED.model, encrypted_key = EXCLUDED.encrypted_key, encrypted_search_key = EXCLUDED.encrypted_search_key, api_format = EXCLUDED.api_format, instructions = EXCLUDED.instructions, max_steps = EXCLUDED.max_steps, model_options = EXCLUDED.model_options, updated_at = NOW()`
        return NextResponse.json({ success: true })
    } catch { return NextResponse.json({ error: "Unable to save agent settings. Check server encryption key, URL and database migration." }, { status: 400 }) }
}
