import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeAdmin } from '@/lib/auth-helper'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const video = await prisma.video.findUnique({
            where: { id },
            include: { category: true }
        })

        if (!video) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Increment view count
        await prisma.video.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        })

        return NextResponse.json(video)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        const body = await request.json()

        // Auto-generate thumbnail if YouTube URL changed
        let thumbnailUrl = body.thumbnailUrl
        if (body.youtubeUrl && !body.thumbnailUrl) {
            const videoId = extractYouTubeId(body.youtubeUrl)
            if (videoId) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            }
        }

        const video = await prisma.video.update({
            where: { id },
            data: {
                title: body.title,
                description: body.description || null,
                youtubeUrl: body.youtubeUrl,
                thumbnailUrl,
                categoryId: body.categoryId || null,
                tags: body.tags || [],
                published: body.published ?? false,
                featured: body.featured ?? false,
                duration: body.duration || null,
            },
            include: { category: true }
        })

        return NextResponse.json({ video, message: 'Video updated successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to update video' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    try {
        await prisma.video.delete({ where: { id } })
        return NextResponse.json({ message: 'Video deleted successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
    }
}

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
        /youtube\.com\/shorts\/([^&\s?]+)/,
    ]
    for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) return match[1]
    }
    return null
}
