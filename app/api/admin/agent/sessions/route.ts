import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"
async function owner() {
    const session = await getServerSession(authOptions)
    return session?.user?.role === "ADMIN" ? session.user.email : null
}
export async function GET() {
    const email = await owner()
    if (!email) return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const sessions = await prisma.$queryRaw<Array<{id:string;title:string;updated_at:Date}>>`SELECT id,title,updated_at FROM agent_session WHERE owner=${email} ORDER BY updated_at DESC`
        return NextResponse.json({sessions})
    } catch { return NextResponse.json({error:"โหลดรายการแชตไม่สำเร็จ"},{status:503}) }
}
export async function POST() {
    const email = await owner()
    if (!email) return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const id = randomUUID()
        await prisma.$executeRaw`INSERT INTO agent_session (id,owner) VALUES (${id},${email})`
        return NextResponse.json({id,title:"แชตใหม่"},{status:201})
    } catch { return NextResponse.json({error:"สร้างแชตไม่สำเร็จ"},{status:503}) }
}
export async function PATCH(request:Request) {
    const email = await owner()
    if (!email) return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const {id,title} = z.object({id:z.string().uuid(),title:z.string().trim().min(1).max(120)}).parse(await request.json())
        const count = await prisma.$executeRaw`UPDATE agent_session SET title=${title},updated_at=NOW() WHERE id=${id} AND owner=${email}`
        return count ? NextResponse.json({success:true}) : NextResponse.json({error:"ไม่พบแชต"},{status:404})
    } catch { return NextResponse.json({error:"เปลี่ยนชื่อแชตไม่สำเร็จ"},{status:400}) }
}
export async function DELETE(request:Request) {
    const email = await owner()
    if (!email) return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const {id} = z.object({id:z.string().uuid()}).parse(await request.json())
        const count = await prisma.$executeRaw`DELETE FROM agent_session WHERE id=${id} AND owner=${email} AND (active_request IS NULL OR locked_at < NOW() - INTERVAL '2 minutes')`
        return count ? NextResponse.json({success:true}) : NextResponse.json({error:"ไม่พบแชตหรือแชตกำลังทำงาน"},{status:409})
    } catch { return NextResponse.json({error:"ลบแชตไม่สำเร็จ"},{status:400}) }
}
