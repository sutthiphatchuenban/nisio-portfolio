import { NextResponse } from 'next/server'
import { authorizeAdmin } from '@/lib/auth-helper'

export async function GET(request: Request) {
    const auth = await authorizeAdmin(request)
    if (!auth.isAuthorized) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    const videoId = extractYouTubeId(url)
    if (!videoId) {
        return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        // Fallback: return thumbnail only (no API key needed)
        return NextResponse.json({
            videoId,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: null,
            title: null,
        })
    }

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${apiKey}`
        )
        const data = await res.json()

        if (!data.items || data.items.length === 0) {
            return NextResponse.json({ error: 'Video not found on YouTube' }, { status: 404 })
        }

        const item = data.items[0]
        const duration = parseDuration(item.contentDetails.duration)
        const thumbnailUrl = item.snippet.thumbnails?.maxres?.url
            || item.snippet.thumbnails?.high?.url
            || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`

        return NextResponse.json({
            videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl,
            duration,
            tags: item.snippet.tags || [],
        })
    } catch (error) {
        console.error('YouTube API error:', error)
        return NextResponse.json({
            videoId,
            thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
            duration: null,
            title: null,
        })
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

// Convert ISO 8601 duration (PT1H2M3S) to readable format (1:02:03)
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
