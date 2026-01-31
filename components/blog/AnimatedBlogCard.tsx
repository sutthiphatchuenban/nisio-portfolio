"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, ArrowRight, Eye, Sparkles } from "lucide-react"
import { format } from "date-fns"
import type { BlogPost } from "@/types"

interface AnimatedBlogCardProps {
  post: BlogPost
  priority?: boolean
  index?: number
  featured?: boolean
}

export default function AnimatedBlogCard({
  post,
  priority = false,
  index = 0,
  featured = false
}: AnimatedBlogCardProps) {
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setMousePosition({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleCardClick = useCallback(() => {
    router.push(`/blog/${post.slug}`)
  }, [router, post.slug])

  // Calculate reading time (approx 200 words per minute)
  const readingTime = Math.ceil((post.content?.split(' ').length || 0) / 200)

  // Calculate animation delay
  const animationDelay = index * 0.15

  // Format date
  const formattedDate = post.publishedAt 
    ? format(new Date(post.publishedAt), 'MMM d, yyyy')
    : format(new Date(post.createdAt), 'MMM d, yyyy')

  return (
    <div
      className={`animate-fade-in-up ${featured ? 'md:col-span-2 lg:col-span-2' : ''}`}
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Card
        ref={cardRef}
        className="group relative overflow-hidden cursor-pointer h-full border-2 border-transparent hover:border-primary/20 transition-all duration-500"
        style={{
          transform: isHovered ? 'scale(1.02) translateY(-4px)' : 'scale(1) translateY(0)',
          boxShadow: isHovered ? '0 20px 40px -15px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        onClick={handleCardClick}
      >
          {/* Spotlight Effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary-rgb, 59, 130, 246), 0.1) 0%, transparent 50%)`,
            }}
          />

          <CardContent className="p-0 h-full flex flex-col">
            {/* Image Container */}
            <div className={`relative overflow-hidden ${featured ? 'aspect-[21/9]' : 'aspect-video'}`}>
              {post.coverImage ? (
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  priority={priority}
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted via-muted/80 to-muted/50 flex items-center justify-center">
                  <div className="text-6xl opacity-30">📝</div>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />

              {/* Featured Badge */}
              {post.featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm gap-1">
                    <Sparkles className="w-3 h-3" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Published Badge */}
              {!post.published && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="backdrop-blur-sm bg-background/80">
                    Draft
                  </Badge>
                </div>
              )}

              {/* Hover Arrow */}
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1 space-y-3">
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <Badge 
                      key={tag} 
                      variant="outline" 
                      className="text-xs font-normal bg-primary/5 hover:bg-primary/10 transition-colors"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Title */}
              <h3 className={`font-bold group-hover:text-primary transition-colors duration-300 line-clamp-2 ${
                featured ? 'text-2xl md:text-3xl' : 'text-lg'
              }`}>
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed flex-1">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {readingTime} min read
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {post.viewCount?.toLocaleString() || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
