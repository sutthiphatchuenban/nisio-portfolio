import { MeetingStore } from '@/lib/meeting-store'

export const dynamic = 'force-dynamic'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params
    const { searchParams } = new URL(request.url)
    const initialAfter = searchParams.get('after') ? parseInt(searchParams.get('after')!) : 0

    let lastTimestamp = initialAfter
    let lastEventSeq = 0
    let isClosed = false

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial ping/connection event
            controller.enqueue(
                encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: Date.now() })}\n\n`)
            )

            const interval = setInterval(async () => {
                if (isClosed || request.signal.aborted) {
                    clearInterval(interval)
                    try {
                        controller.close()
                    } catch {}
                    return
                }

                try {
                    // 1. Check if room was closed by host
                    const room = await MeetingStore.getRoom(code)
                    if (room && !room.isActive) {
                        controller.enqueue(
                            encoder.encode(`event: room_closed\ndata: ${JSON.stringify({ message: 'โฮสต์ได้ปิดห้องประชุมและลบไฟล์ทั้งหมดแล้ว' })}\n\n`)
                        )
                        clearInterval(interval)
                        try {
                            controller.close()
                        } catch {}
                        return
                    }

                    // 2. Check for new messages
                    const newMessages = MeetingStore.getMessages(code, lastTimestamp)
                    if (newMessages.length > 0) {
                        lastTimestamp = Math.max(...newMessages.map((m) => m.createdAt))
                        controller.enqueue(
                            encoder.encode(`event: messages\ndata: ${JSON.stringify(newMessages)}\n\n`)
                        )
                    }

                    // 2b. Check for edit/delete events
                    const events = MeetingStore.getEvents(code, lastEventSeq)
                    if (events.length > 0) {
                        lastEventSeq = Math.max(...events.map((e) => e.seq))
                        const updated = events.filter((e) => e.type === 'message_updated' && e.message)
                        const deleted = events.filter((e) => e.type === 'message_deleted')
                        if (updated.length > 0) {
                            controller.enqueue(
                                encoder.encode(`event: message_updated\ndata: ${JSON.stringify(updated.map((e) => e.message))}\n\n`)
                            )
                        }
                        if (deleted.length > 0) {
                            controller.enqueue(
                                encoder.encode(`event: message_deleted\ndata: ${JSON.stringify(deleted.map((e) => e.messageId))}\n\n`)
                            )
                        }
                    }

                    // 3. Stream heartbeat / ping every interval to keep connection alive
                    controller.enqueue(
                        encoder.encode(`event: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`)
                    )
                } catch {
                    clearInterval(interval)
                    try {
                        controller.close()
                    } catch {}
                }
            }, 1000)

            request.signal.addEventListener('abort', () => {
                isClosed = true
                clearInterval(interval)
                try {
                    controller.close()
                } catch {}
            })
        },
        cancel() {
            isClosed = true
        },
    })

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform, no-store',
            Connection: 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    })
}
