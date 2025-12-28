import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    const where: any = {}
    if (category) {
        where.category = category
    }

    try {
        const skills = await prisma.skill.findMany({
            where,
            orderBy: { orderIndex: 'asc' }
        })

        const distinctCategories = await prisma.skill.findMany({
            select: { category: true },
            distinct: ['category']
        })
        const categories = distinctCategories
            .map(c => c.category)
            .filter((c): c is string => c !== null)

        return NextResponse.json({
            skills,
            categories
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const skill = await prisma.skill.create({
            data: {
                name: body.name,
                category: body.category,
                proficiency: body.proficiency,
                icon: body.icon,
                orderIndex: body.orderIndex
            }
        })

        return NextResponse.json({
            skill,
            message: 'Skill created successfully'
        })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to create skill' }, { status: 500 })
    }
}
