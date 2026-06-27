import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeAdmin } from '@/lib/auth-helper'

export async function GET() {
    try {
        const categories = await prisma.videoCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: { select: { videos: true } }
            }
        })
        return NextResponse.json(categories)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch video categories' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        if (!body.name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 })
        }

        const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        const category = await prisma.videoCategory.create({
            data: {
                name: body.name,
                slug,
                description: body.description || null,
                color: body.color || null,
            }
        })

        return NextResponse.json({ category, message: 'Category created successfully' })
    } catch (error: any) {
        if (error?.code === 'P2002') {
            return NextResponse.json({ error: 'Category slug already exists' }, { status: 409 })
        }
        console.error(error)
        return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }
}
