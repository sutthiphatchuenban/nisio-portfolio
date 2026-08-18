import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        if (!code) {
            return NextResponse.json({ message: 'Room code required' }, { status: 400 })
        }

        const room = await MeetingStore.getRoom(code)
        if (!room) {
            return NextResponse.json({ message: 'ไม่พบห้องประชุมนี้' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                code: room.code,
                name: room.name,
                hasPasscode: !!(room.passcode && room.passcode.length > 0),
                hostName: room.hostName,
                hostColor: room.hostColor,
                createdAt: room.createdAt,
            },
        })
    } catch (error: any) {
        console.error('Get room error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาด', error: error.message },
            { status: 500 }
        )
    }
}
