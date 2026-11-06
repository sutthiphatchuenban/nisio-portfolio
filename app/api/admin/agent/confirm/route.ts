import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { z } from "zod"
import { MeetingStore } from "@/lib/meeting-store"
export async function POST(request:Request) {
    const session=await getServerSession(authOptions)
    if(session?.user?.role!=="ADMIN" || !session.user.email)return NextResponse.json({error:"Unauthorized"},{status:401})
    try {
        const {id}=z.object({id:z.string().uuid()}).parse(await request.json())
        const owner=session.user.email
        const meetingRows=await prisma.$queryRaw<Array<{target_id:string;title:string}>>`SELECT target_id,title FROM agent_confirmation WHERE id=${id} AND owner=${owner} AND kind='meeting' AND status='pending' AND created_at > NOW() - INTERVAL '10 minutes'`
        if (meetingRows.length) {
            const claimed=await prisma.$executeRaw`UPDATE agent_confirmation SET status='running' WHERE id=${id} AND owner=${owner} AND kind='meeting' AND status='pending'`
            if (!claimed) throw new Error("Confirmation already used")
            try {
                const closed=await MeetingStore.closeAndCleanupRoom(meetingRows[0].target_id,session.user.name || "Admin",true)
                if (!closed.success) throw new Error("Meeting closure failed")
                await prisma.$executeRaw`UPDATE agent_confirmation SET status='done' WHERE id=${id} AND owner=${owner}`
                return NextResponse.json({success:true,title:meetingRows[0].title})
            } catch {
                await prisma.$executeRaw`UPDATE agent_confirmation SET status='failed' WHERE id=${id} AND owner=${owner}`
                return NextResponse.json({error:"ปิดห้องไม่สำเร็จทั้งหมด โปรดตรวจสอบห้องและไฟล์ก่อนลองอีกครั้ง"},{status:500})
            }
        }
        const result=await prisma.$transaction(async tx=>{
            const rows=await tx.$queryRaw<Array<{kind:string;target_id:string;title:string}>>`UPDATE agent_confirmation SET status='running' WHERE id=${id} AND owner=${owner} AND status='pending' AND created_at > NOW() - INTERVAL '10 minutes' RETURNING kind,target_id,title`
            const item=rows[0]
            if(!item)throw new Error("Confirmation expired or already used")
            if(item.kind==="project")await tx.project.delete({where:{id:item.target_id}})
            else if(item.kind==="blog")await tx.blogPost.delete({where:{id:item.target_id}})
            else if(item.kind==="skill")await tx.skill.delete({where:{id:item.target_id}})
            else if(item.kind==="video")await tx.video.delete({where:{id:item.target_id}})
            else if(item.kind==="message")await tx.contact.delete({where:{id:item.target_id}})
            else throw new Error("Unknown target")
            await tx.$executeRaw`UPDATE agent_confirmation SET status='done' WHERE id=${id}`
            return {title:item.title}
        })
        return NextResponse.json({success:true,...result})
    } catch {return NextResponse.json({error:"ลบไม่สำเร็จ รายการอาจหมดอายุ ถูกลบแล้ว หรือไม่พบข้อมูล"},{status:409})}
}
