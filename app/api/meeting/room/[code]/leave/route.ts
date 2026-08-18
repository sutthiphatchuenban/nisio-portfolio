import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { userName } = body

        if (userName) {
            MeetingStore.leaveRoom({
                roomCode: code,
                userName: userName.trim(),
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Left room successfully',
        })
    } catch (error: any) {
        console.error('Leave room error:', error)
        return NextResponse.json(
            { message: 'Error leaving room', error: error.message },
            { status: 500 }
        )
    }
}
