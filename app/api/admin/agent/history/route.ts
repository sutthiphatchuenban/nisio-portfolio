import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"
export const dynamic = "force-dynamic"
export async function GET() {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== "ADMIN" || !session.user.email) return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const rows = await prisma.$queryRaw<Array<{messages:unknown}>>`SELECT messages FROM agent_history WHERE owner = ${session.user.email}`
        const messages = Array.isArray(rows[0]?.messages) ? rows[0].messages : []
        const ids = messages.flatMap((message:any) => (message.actions || []).map((action:any) => action.confirmId).filter((id:any) => typeof id === "string"))
        const confirmations = ids.length ? await prisma.$queryRaw<Array<{id:string;status:string}>>`SELECT id,status FROM agent_confirmation WHERE owner = ${session.user.email} AND id IN (${Prisma.join(ids)})` : []
        const completed = new Set(confirmations.filter(item=>item.status === "done").map(item=>item.id))
        return NextResponse.json({messages:messages.map((message:any)=>({...message,actions:message.actions?.map((action:any)=>({...action,completed:completed.has(action.confirmId)}))}))})
    } catch { return NextResponse.json({error:"Unable to load agent history"},{status:503}) }
}
