"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Eye } from "lucide-react"
import type { Video, VideoCategory } from "@/types"

interface VideoListProps {
    videos: Video[]
    categories: VideoCategory[]
}

export function VideoList({ videos, categories }: VideoListProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null)

    const filteredVideos = activeCategory
        ? videos.filter(v => v.category?.slug === activeCategory)
        : videos

    return (
        <div>
            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                    <Button
                        variant={activeCategory === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveCategory(null)}
                    >
                        All
                    </Button>
                    {categories.map((cat) => (
                        <Button
                            key={cat.id}
                            variant={activeCategory === cat.slug ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveCategory(cat.slug)}
                        >
                            {cat.name}
                        </Button>
                    ))}
                </div>
            )}

            {/* Video Grid */}
            {filteredVideos.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    No videos found. Check back later!
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVideos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                    ))}
                </div>
            )}
        </div>
    )
}

function VideoCard({ video }: { video: Video }) {
    const thumbnailUrl = video.thumbnailUrl || "/placeholder-video.jpg"

    return (
        <Link href={`/videos/${video.id}`}>
            <div className="group relative rounded-lg border bg-card overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                    <img
                        src={thumbnailUrl}
                        alt={video.title}
                        className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="rounded-full bg-white/90 p-3">
                            <Play className="h-6 w-6 text-black fill-black" />
                        </div>
                    </div>
                    {/* Duration badge */}
                    {video.duration && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
                            {video.duration}
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="p-4">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {video.title}
                    </h3>
                    {video.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {video.description}
                        </p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {video.category && (
                            <Badge variant="secondary" className="text-xs">
                                {video.category.name}
                            </Badge>
                        )}
                        <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {video.viewCount}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
