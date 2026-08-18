import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { userName, userColor, userAvatar, isHost } = body

        if (!userName || userName.trim() === '') {
            return NextResponse.json({ message: 'Missing user name' }, { status: 400 })
        }

        const participants = MeetingStore.updateHeartbeat({
            roomCode: code,
            userName: userName.trim(),
            userColor,
            userAvatar,
            isHost,
        })

        return NextResponse.json({
            success: true,
            participants,
        })
    } catch (error: any) {
        console.error('Heartbeat error:', error)
        return NextResponse.json(
            { message: 'Heartbeat failed', error: error.message },
            { status: 500 }
        )
    }
}
