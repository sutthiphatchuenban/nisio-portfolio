import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const skill = await prisma.skill.update({
            where: { id: params.id },
            data: {
                name: body.name,
                category: body.category,
                proficiency: body.proficiency,
                icon: body.icon,
                orderIndex: body.orderIndex
            }
        })
        return NextResponse.json(skill)
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update skill' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.skill.delete({
            where: { id: params.id }
        })
        return NextResponse.json({ message: 'Skill deleted successfully' })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete skill' }, { status: 500 })
    }
}
