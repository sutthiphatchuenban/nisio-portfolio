import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { decrypt, getAgentConfig, providerPost, providerSessionId } from "@/lib/agent-config"
export async function POST(request:Request) {
    const session=await getServerSession(authOptions)
    if(session?.user?.role!=="ADMIN")return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const body=await request.json().catch(()=>({}))
        const toolProbe=body.mode === "tools"
        const config=await getAgentConfig()
        if(!config)return NextResponse.json({error:"บันทึกการเชื่อมต่อก่อนทดสอบ"},{status:400})
        const responses=config.api_format==="responses",anthropic=config.api_format==="anthropic"
        const definition={name:"agent_probe",description:"Report a successful tool calling test",parameters:{type:"object",properties:{},additionalProperties:false}}
        const prompt=toolProbe?"Call the agent_probe tool now.":"Reply OK"
        const payload:any=responses?{model:config.model,input:prompt,max_output_tokens:128}:{model:config.model,messages:[{role:"user",content:prompt}],max_tokens:128}
        if(toolProbe){
            if(anthropic){payload.tools=[{name:definition.name,description:definition.description,input_schema:definition.parameters}];payload.tool_choice={type:"tool",name:definition.name}}
            else if(responses){payload.tools=[{type:"function",...definition}];payload.tool_choice={type:"function",name:definition.name}}
            else {payload.tools=[{type:"function",function:definition}];payload.tool_choice={type:"function",function:{name:definition.name}}}
        }
        const apiKey=decrypt(config.encrypted_key)
        const result=await providerPost(config.base_url,responses?"/responses":anthropic?"/messages":"/chat/completions",apiKey,payload,45000,config.api_format,providerSessionId(session.user.email || "admin"))
        if(!result.ok){let detail="";try { const data=await result.json(); const message=data?.error?.message || data?.message; if(typeof message === "string") detail=message.replaceAll(apiKey,"[redacted]").slice(0,400) } catch {};return NextResponse.json({error:"ผู้ให้บริการตอบกลับ " + result.status + (detail ? ": " + detail : "")},{status:502})}
        const data=await result.json()
        if(responses ? !Array.isArray(data.output) : anthropic ? !Array.isArray(data.content) : !Array.isArray(data.choices))return NextResponse.json({error:"รูปแบบคำตอบไม่ตรงกับ API ที่เลือก"},{status:502})
        if(toolProbe){const calls=responses?data.output.filter((x:any)=>x.type==="function_call"):anthropic?data.content.filter((x:any)=>x.type==="tool_use"):data.choices?.[0]?.message?.tool_calls || [];if(!calls.length)return NextResponse.json({error:"โมเดลตอบกลับโดยไม่เรียกเครื่องมือ ตรวจสอบว่ารองรับ tool calling"},{status:422})}
        return NextResponse.json({success:true})
    } catch {return NextResponse.json({error:"เชื่อมต่อไม่สำเร็จ ตรวจสอบ URL, API key และ Model ID"},{status:502})}
}
