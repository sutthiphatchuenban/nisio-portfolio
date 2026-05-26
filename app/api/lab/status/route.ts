import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const revalidate = 0

export async function GET(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const ipAddress = typeof ip === 'string' ? ip.split(',')[0].trim() : ip[0]

        const isLocal = ipAddress === '::1' || ipAddress === '127.0.0.1' || ipAddress.includes('127.0.0.1') || process.env.NODE_ENV === 'development'

        if (ipAddress === 'unknown' || isLocal) {
            return NextResponse.json({ count: 0, remaining: 3 })
        }

        const limit = await prisma.aiGenerationLimit.findUnique({
            where: { ipAddress }
        })

        const count = limit ? limit.count : 0
        const remaining = Math.max(0, 3 - count)

        return NextResponse.json({ count, remaining })
    } catch (error) {
        console.error('Error fetching generation status:', error)
        return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
    }
}
