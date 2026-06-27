import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Eye, Calendar, Tag } from "lucide-react"
import type { Video } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params

    const video = await prisma.video.findUnique({
        where: { id, published: true },
        include: { category: true }
    })

    if (!video) {
        return { title: "Video Not Found" }
    }

    const thumbnailUrl = video.thumbnailUrl || `${siteConfig.url}/og-image.png`

    return {
        title: video.title,
        description: video.description || `Watch ${video.title}`,
        keywords: [...video.tags, video.category?.name || "", "video", "youtube", ...siteConfig.keywords].filter(Boolean),
        alternates: { canonical: getAbsoluteUrl(`/videos/${video.id}`) },
        openGraph: {
            title: video.title,
            description: video.description || `Watch ${video.title}`,
            url: getAbsoluteUrl(`/videos/${video.id}`),
            type: "video.other",
            images: [{ url: thumbnailUrl, width: 1280, height: 720, alt: video.title }],
        },
    }
}

export const revalidate = 0

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

export default async function VideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const video = await prisma.video.findUnique({
        where: { id, published: true },
        include: { category: true }
    }) as unknown as Video | null

    if (!video) notFound()

    // Increment view count
    await prisma.video.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
    })

    const youtubeId = extractYouTubeId(video.youtubeUrl)

    // Get related videos - by same category or matching tags
    const relatedConditions = []
    if (video.categoryId) relatedConditions.push({ categoryId: video.categoryId })
    if (video.tags.length > 0) relatedConditions.push({ tags: { hasSome: video.tags } })

    const relatedVideos = await prisma.video.findMany({
        where: {
            published: true,
            id: { not: video.id },
            ...(relatedConditions.length > 0 ? { OR: relatedConditions } : {}),
        },
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    })

    return (
        <div className="container py-10">
            {/* Back button */}
            <Link href="/videos">
                <Button variant="ghost" className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Videos
                </Button>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {/* YouTube Embed */}
                    {youtubeId ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    ) : (
                        <div className="aspect-video rounded-lg bg-muted flex items-center justify-center">
                            <p className="text-muted-foreground">Video unavailable</p>
                        </div>
                    )}

                    {/* Video Info */}
                    <div className="mt-6">
                        <h1 className="text-2xl md:text-3xl font-bold">{video.title}</h1>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {video.viewCount} views
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(video.createdAt).toLocaleDateString('th-TH', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </span>
                            {video.category && (
                                <Badge variant="secondary">{video.category.name}</Badge>
                            )}
                        </div>

                        {/* Tags */}
                        {video.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {video.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                        <Tag className="h-3 w-3 mr-1" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        {/* Description */}
                        {video.description && (
                            <div className="mt-6 p-4 rounded-lg bg-muted/50">
                                <p className="whitespace-pre-wrap text-sm">{video.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Related Videos */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
                    {relatedVideos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No related videos yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {relatedVideos.map((rv: any) => (
                                <Link key={rv.id} href={`/videos/${rv.id}`}>
                                    <div className="flex gap-3 group hover:bg-muted/50 rounded-lg p-2 transition-colors">
                                        <div className="relative w-40 aspect-video rounded overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                                src={rv.thumbnailUrl || "/placeholder-video.jpg"}
                                                alt={rv.title}
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                                                {rv.title}
                                            </h3>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {rv.viewCount} views
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
