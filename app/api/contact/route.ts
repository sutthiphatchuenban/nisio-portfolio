import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        if (!body.name || !body.email || !body.message) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const ua = request.headers.get('user-agent') || 'unknown'

        const contact = await prisma.contact.create({
            data: {
                name: body.name,
                email: body.email,
                subject: body.subject,
                message: body.message,
                ipAddress: typeof ip === 'string' ? ip : ip[0], // x-forwarded-for can be array
                userAgent: ua
            }
        })

        // Broadcast to Dashboard via Internal API
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
        await fetch(`${baseUrl}/api/socket/broadcast`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXTAUTH_SECRET}`
            },
            body: JSON.stringify({ event: 'new-contact', data: contact })
        }).catch(err => console.error("Socket broadcast failed:", err));

        return NextResponse.json({
            message: 'Contact message sent successfully',
            contactId: contact.id
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to send message' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit
    const where: any = {}
    if (status) where.status = status

    try {
        const [contacts, total] = await prisma.$transaction([
            prisma.contact.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.contact.count({ where })
        ])

        const unreadCount = await prisma.contact.count({
            where: { status: 'pending' }
        })

        return NextResponse.json({
            contacts,
            total,
            unreadCount
        })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch contacts' }, { status: 500 })
    }
}
