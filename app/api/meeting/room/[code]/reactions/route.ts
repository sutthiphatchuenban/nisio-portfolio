import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { messageId, emoji, userName } = body

        if (!messageId || !emoji || !userName) {
            return NextResponse.json({ message: 'Missing parameters' }, { status: 400 })
        }

        const reactions = MeetingStore.toggleReaction({
            roomCode: code,
            messageId,
            emoji,
            userName,
        })

        if (!reactions) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            reactions,
        })
    } catch (error: any) {
        console.error('Toggle reaction error:', error)
        return NextResponse.json(
            { message: 'Failed to update reaction', error: error.message },
            { status: 500 }
        )
    }
}
