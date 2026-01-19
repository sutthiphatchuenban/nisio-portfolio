import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeAdmin } from '@/lib/auth-helper'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')
    const includeUnpublished = searchParams.get('includeUnpublished') === 'true'

    const skip = (page - 1) * limit

    const where: Prisma.BlogPostWhereInput = {}

    // Only show published posts for public access
    if (!includeUnpublished) {
        where.published = true
    }

    if (tag) {
        where.tags = { has: tag }
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { excerpt: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
        ]
    }

    if (featured === 'true') {
        where.featured = true
    }

    try {
        const [posts, total] = await prisma.$transaction([
            prisma.blogPost.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.blogPost.count({ where })
        ])

        return NextResponse.json({
            posts,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Generate slug from title if not provided, supporting Thai characters
        const slug = body.slug || body.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s\u0E00-\u0E7F-]/g, '') // Keep alphanumeric, spaces, Thai characters, and dashes
            .replace(/\s+/g, '-')                  // Replace spaces with dashes
            .replace(/-+/g, '-')                   // Replace multiple dashes with single dash
            .replace(/(^-|-$)/g, '')               // Trim dashes from start and end

        // Check if slug already exists
        const existing = await prisma.blogPost.findUnique({
            where: { slug }
        })

        if (existing) {
            return NextResponse.json({ message: 'A post with this slug already exists' }, { status: 400 })
        }

        const post = await prisma.blogPost.create({
            data: {
                title: body.title,
                slug,
                excerpt: body.excerpt,
                content: body.content,
                coverImage: body.coverImage,
                images: body.images || [],
                tags: body.tags || [],
                published: body.published || false,
                featured: body.featured || false,
                publishedAt: body.published ? new Date() : null,
            }
        })

        return NextResponse.json({
            post,
            message: 'Blog post created successfully'
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to create blog post' }, { status: 500 })
    }
}
