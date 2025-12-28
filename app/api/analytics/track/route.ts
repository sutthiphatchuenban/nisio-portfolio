import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const ua = request.headers.get('user-agent') || 'unknown'

        await prisma.analytics.create({
            data: {
                pagePath: body.pagePath,
                pageTitle: body.pageTitle,
                referrer: body.referrer,
                sessionId: body.sessionId,
                duration: body.duration,
                ipAddress: typeof ip === 'string' ? ip : ip[0],
                userAgent: ua
            }
        })

        // Broadcast to Dashboard via Internal API
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        // Don't await specifically for analytics to avoid blocking user response
        fetch(`${baseUrl}/api/socket/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
            },
            body: JSON.stringify({ event: 'page-view', data: { path: body.pagePath } })
        }).catch(err => console.error("Socket broadcast failed:", err));

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Track failed' }, { status: 500 })
    }
}
