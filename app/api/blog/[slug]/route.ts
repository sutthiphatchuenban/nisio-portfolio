import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    try {
        const decodedSlug = decodeURIComponent(params.slug)
        const post = await prisma.blogPost.findUnique({
            where: { slug: decodedSlug }
        })

        if (!post) {
            return NextResponse.json({ message: 'Blog post not found' }, { status: 404 })
        }

        // Only increment view count for published posts
        if (post.published) {
            await prisma.blogPost.update({
                where: { id: post.id },
                data: { viewCount: { increment: 1 } }
            })
        }

        return NextResponse.json({ post })
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const currentPost = await prisma.blogPost.findUnique({
            where: { slug: params.slug }
        })

        // Generate slug from title if empty, supporting Thai characters
        let newSlug = body.slug || params.slug
        if (!body.slug && body.title) {
            newSlug = body.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s\u0E00-\u0E7F-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/(^-|-$)/g, '')
        }

        // Check if new slug conflicts with other posts
        if (newSlug !== params.slug) {
            const existing = await prisma.blogPost.findUnique({
                where: { slug: newSlug }
            })
            if (existing) {
                return NextResponse.json({ message: 'A post with this slug already exists' }, { status: 400 })
            }
        }

        const post = await prisma.blogPost.update({
            where: { slug: params.slug },
            data: {
                title: body.title,
                slug: newSlug,
                excerpt: body.excerpt,
                content: body.content,
                coverImage: body.coverImage,
                images: body.images || [],
                tags: body.tags || [],
                published: body.published,
                featured: body.featured,
                // Set publishedAt only when first published
                publishedAt: body.published && !currentPost?.publishedAt ? new Date() : currentPost?.publishedAt,
            }
        })

        return NextResponse.json({
            post,
            message: 'Blog post updated successfully'
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to update blog post' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    try {
        if (id || params.slug === 'unknown') {
            await prisma.blogPost.delete({
                where: { id: id || undefined }
            })
        } else {
            await prisma.blogPost.delete({
                where: { slug: params.slug }
            })
        }

        return NextResponse.json({
            message: 'Blog post deleted successfully'
        })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete blog post' }, { status: 500 })
    }
}
