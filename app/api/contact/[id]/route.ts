import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const contact = await prisma.contact.update({
            where: { id: params.id },
            data: {
                status: body.status // 'read' | 'pending' | 'replied'
            }
        })
        return NextResponse.json(contact)
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update message status' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.contact.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ message: 'Message deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete message' }, { status: 500 })
    }
}
