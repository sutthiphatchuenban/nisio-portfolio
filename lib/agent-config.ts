import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes } from "crypto"
import { lookup } from "dns/promises"
import { isIP } from "net"
import { request as httpsRequest } from "https"
import prisma from "@/lib/prisma"

function key() {
    const secret = process.env.AGENT_ENCRYPTION_KEY
    if (!secret || secret.length < 32) throw new Error("Set AGENT_ENCRYPTION_KEY (at least 32 characters) on the server")
    return createHash("sha256").update(secret).digest()
}
export function encrypt(value: string) {
    const iv = randomBytes(12), cipher = createCipheriv("aes-256-gcm", key(), iv)
    const ciphertext = Buffer.concat([cipher.update(value, "utf8"), cipher.final()])
    return [iv, cipher.getAuthTag(), ciphertext].map(part => part.toString("base64url")).join(".")
}
export function decrypt(value: string) {
    const [iv, tag, data] = value.split(".").map(part => Buffer.from(part, "base64url"))
    const cipher = createDecipheriv("aes-256-gcm", key(), iv)
    cipher.setAuthTag(tag)
    return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8")
}
export function providerSessionId(owner: string) {
    return createHmac("sha256", key()).update("agent-session:" + owner).digest("hex")
}
export async function getAgentConfig() {
    const rows = await prisma.$queryRaw<Array<{base_url:string;model:string;encrypted_key:string;encrypted_search_key:string | null;api_format:string;instructions:string;max_steps:number;model_options:any}>>`SELECT base_url, model, encrypted_key, encrypted_search_key, api_format, instructions, max_steps, model_options FROM agent_config WHERE id = 'default'`
    return rows[0] || null
}
async function resolveEndpoint(input: string) {
    const url = new URL(input)
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Base URL must be a public HTTPS URL without credentials or query")
    const addresses = await lookup(url.hostname, { all: true })
    if (!addresses.length || addresses.some(({ address }) => {
        if (isIP(address) === 6) return !/^[23]/i.test(address) || /^2001:db8:/i.test(address)
        const parts = address.split(".").map(Number)
        return parts[0] === 0 || parts[0] === 10 || parts[0] === 127 || parts[0] >= 224 || (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)
    })) throw new Error("Base URL must resolve only to public addresses")
    const ipv4 = addresses.find(item => item.family === 4)
    if (!ipv4) throw new Error("Provider must support IPv4")
    return {base:url.toString().replace(/\/+$/, ""),address:ipv4.address}
}
export async function validateEndpoint(input: string) { return (await resolveEndpoint(input)).base }
export async function providerPost(baseUrl:string, path:string, apiKey:string, payload:unknown, timeoutMs = 45000, format = "chat", sessionId?:string): Promise<{ok:boolean;status:number;json:()=>Promise<any>}> {
    const {base,address} = await resolveEndpoint(baseUrl)
    const body = JSON.stringify(payload)
    return await new Promise((resolve,reject)=>{
        const req = httpsRequest(base + path, {method:"POST",family:4,headers:{"Content-Type":"application/json","User-Agent":"nisio-admin-agent/1.0",...(new URL(base).hostname === "opencode.ai" && sessionId ? {"x-opencode-session":sessionId} : {}),...(format === "anthropic" ? {"x-api-key":apiKey,"anthropic-version":"2023-06-01"} : {Authorization:"Bearer " + apiKey}),"Content-Length":Buffer.byteLength(body)},lookup:((_host:any,_options:any,callback:any)=>callback(null,address,4)) as any,signal:AbortSignal.timeout(timeoutMs)}, response=>{
            const chunks:Buffer[]=[];let length=0
            response.on("data",(chunk:Buffer)=>{length+=chunk.length;if(length>4*1024*1024){req.destroy(new Error("Response too large"));return}chunks.push(chunk)})
            response.on("error",reject)
            response.on("end",()=>{const status=response.statusCode || 500;const data=Buffer.concat(chunks).toString("utf8");resolve({ok:status>=200&&status<300,status,json:async()=>JSON.parse(data)})})
        })
        req.on("error",reject);req.end(body)
    })
}
