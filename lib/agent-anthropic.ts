type Entry = { role:string; content:any; tool_calls?:any[]; tool_call_id?:string; _anthropicContent?:any[] }
export function anthropicRequest(model:string, messages:Entry[], tools:any[], maxTokens:number, reasoning:Record<string,unknown>) {
    const system = messages.filter(entry=>entry.role === "system").map(entry=>entry.content).join("\n\n")
    const converted:any[] = []
    for (const entry of messages) {
        if (entry.role === "system") continue
        if (entry.role === "tool") {
            const result={type:"tool_result",tool_use_id:entry.tool_call_id,content:entry.content}
            const last=converted[converted.length-1]
            if (last?.role === "user" && Array.isArray(last.content) && last.content.every((item:any)=>item.type === "tool_result")) last.content.push(result)
            else converted.push({role:"user",content:[result]})
            continue
        }
        if (entry.role === "assistant" && entry._anthropicContent) { converted.push({role:"assistant",content:entry._anthropicContent});continue }
        const content=Array.isArray(entry.content) ? entry.content.map(part=>part.type === "image_url" ? {type:"image",source:{type:"url",url:part.image_url.url}} : {type:"text",text:part.text}) : entry.content
        converted.push({role:entry.role,content})
    }
    return {model,system,messages:converted,max_tokens:maxTokens,tools:tools.map(item=>({name:item.function.name,description:item.function.description,input_schema:item.function.parameters})),...reasoning}
}
export function anthropicResponse(data:any) {
    if (!Array.isArray(data.content)) throw new Error("Invalid Anthropic response")
    return {role:"assistant",content:data.content.filter((part:any)=>part.type === "text").map((part:any)=>part.text + ((part.citations || []).filter((c:any)=>c.url).map((c:any)=>"\n["+(c.title || "Source")+"]("+c.url+")").join(""))).join("\n") || null,tool_calls:data.content.filter((part:any)=>part.type === "tool_use").map((part:any)=>({id:part.id,type:"function",function:{name:part.name,arguments:JSON.stringify(part.input)}})),_anthropicContent:data.content}
}
