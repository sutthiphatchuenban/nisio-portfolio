import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { authorizeAdmin } from '@/lib/auth-helper'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'newest'

    const skip = (page - 1) * limit

    const where: Prisma.VideoWhereInput = {}

    // Only show published videos for public
    const auth = await authorizeAdmin(request).catch(() => ({ isAuthorized: false }))
    if (!auth.isAuthorized) {
        where.published = true
    }

    if (category) {
        where.category = { slug: category }
    }

    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } }
        ]
    }

    let orderBy: Prisma.VideoOrderByWithRelationInput | Prisma.VideoOrderByWithRelationInput[] = { createdAt: 'desc' }
    if (sort === 'oldest') orderBy = { createdAt: 'asc' }
    if (sort === 'popular') orderBy = { viewCount: 'desc' }
    if (sort === 'featured') orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }]

    try {
        const [videos, total] = await prisma.$transaction([
            prisma.video.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: { category: true }
            }),
            prisma.video.count({ where })
        ])

        return NextResponse.json({
            videos,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        if (!body.title || !body.youtubeUrl) {
            return NextResponse.json({ message: 'Title and YouTube URL are required' }, { status: 400 })
        }

        const videoId = extractYouTubeId(body.youtubeUrl)

        // Auto-fetch thumbnail and duration from YouTube
        let thumbnailUrl = body.thumbnailUrl
        let duration = body.duration

        if (videoId) {
            if (!thumbnailUrl) {
                thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
            }
            // Try to fetch duration from YouTube API if not provided
            if (!duration) {
                const ytMeta = await fetchYouTubeMetadata(videoId)
                if (ytMeta) {
                    duration = ytMeta.duration || null
                    if (!thumbnailUrl && ytMeta.thumbnailUrl) thumbnailUrl = ytMeta.thumbnailUrl
                }
            }
        }

        const video = await prisma.video.create({
            data: {
                title: body.title,
                description: body.description || null,
                youtubeUrl: body.youtubeUrl,
                thumbnailUrl,
                categoryId: body.categoryId || null,
                tags: body.tags || [],
                published: body.published || false,
                featured: body.featured || false,
                duration: duration || null,
            },
            include: { category: true }
        })

        return NextResponse.json({ video, message: 'Video created successfully' })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
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

async function fetchYouTubeMetadata(videoId: string) {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) return null

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
        )
        const data = await res.json()
        if (!data.items || data.items.length === 0) return null

        const item = data.items[0]
        return {
            duration: parseDuration(item.contentDetails.duration),
            thumbnailUrl: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url,
        }
    } catch {
        return null
    }
}

function parseDuration(iso: string): string {
    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"
    const hours = parseInt(match[1] || "0")
    const minutes = parseInt(match[2] || "0")
    const seconds = parseInt(match[3] || "0")
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
