import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    const skip = (page - 1) * limit

    const where: Prisma.ProjectWhereInput = {}

    if (category) {
        where.category = {
            slug: category
        }
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            // technologies is a string array. 'has' might handle exact match. 
            // For partial match in array text, it's harder.
            // We'll trust exact tag match or just text search.
            { technologies: { has: search } }
        ]
    }

    let orderBy: Prisma.ProjectOrderByWithRelationInput | Prisma.ProjectOrderByWithRelationInput[] = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    if (sort === 'featured') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]

    try {
        const [projects, total] = await prisma.$transaction([
            prisma.project.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true }
            }),
            prisma.project.count({ where })
        ])

        return NextResponse.json({
            projects,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

import { authorizeAdmin } from '@/lib/auth-helper'

// ... existing code ...

export async function POST(request: Request) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Basic validation could be added here

        const project = await prisma.project.create({
            data: {
                title: body.title,
                description: body.description,
                shortDescription: body.shortDescription,
                imageUrl: body.imageUrl,
                images: body.images || [],
                projectUrl: body.projectUrl,
                githubUrl: body.githubUrl,
                technologies: body.technologies,
                categoryId: body.categoryId,
                featured: body.featured || false
            },
            include: { category: true }
        })

        return NextResponse.json({
            project,
            message: 'Project created successfully'
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to create project' }, { status: 500 })
    }
}
