import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { requesterName } = body

        const session = await getServerSession(authOptions)
        const isAdmin = session?.user?.role === 'ADMIN'

        const result = await MeetingStore.closeAndCleanupRoom(
            code,
            isAdmin ? session?.user?.name || requesterName || 'Admin' : requesterName
        )

        if (!result.success && !isAdmin) {
            return NextResponse.json(
                { message: result.error || 'ไม่สามารถปิดห้องประชุมได้' },
                { status: 403 }
            )
        }

        return NextResponse.json({
            success: true,
            message: `ปิดห้องประชุมเรียบร้อยแล้ว ลบไฟล์ใน Cloudinary ทั้งหมด ${result.deletedFilesCount} ไฟล์`,
            deletedFilesCount: result.deletedFilesCount,
        })
    } catch (error: any) {
        console.error('Close room error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการปิดห้องประชุม', error: error.message },
            { status: 500 }
        )
    }
}
