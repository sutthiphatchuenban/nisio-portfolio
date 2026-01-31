"use client"

import { useRef, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Github, Eye, Star } from "lucide-react"
import type { Project } from "@/types"

interface AnimatedProjectCardProps {
  project: Project
  priority?: boolean
  index?: number
}

export default function AnimatedProjectCard({
  project,
  priority = false,
  index = 0
}: AnimatedProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation based on mouse position
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10

    setTransform({ rotateX, rotateY })
    setMousePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setTransform({ rotateX: 0, rotateY: 0 })
    setIsHovered(false)
  }, [])

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handleCardClick = useCallback(() => {
    router.push(`/projects/${project.id}`)
  }, [router, project.id])

  const handleExternalLink = useCallback((e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // Calculate animation delay based on index
  const animationDelay = index * 0.1

  return (
    <div
      className="animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <Card
        ref={cardRef}
        className="group relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-primary/30 transition-colors duration-300"
        style={{
          transform: `perspective(1000px) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out",
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
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(var(--primary-rgb, 59, 130, 246), 0.15) 0%, transparent 50%)`,
            }}
          />

          {/* Glow Border Effect */}
          <div 
            className="absolute -inset-[1px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, var(--primary) 0%, transparent 60%)`,
            }}
          />

          <CardContent className="p-0">
            {/* Image Container */}
            <div className="relative aspect-video overflow-hidden">
              {project.imageUrl ? (
                <Image
                  src={project.imageUrl}
                  alt={project.title}
                  fill
                  priority={priority}
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <span className="text-muted-foreground text-4xl">📁</span>
                </div>
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

              {/* Featured Badge */}
              {project.featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm animate-pulse">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                </div>
              )}

              {/* Category Badge */}
              {project.category && (
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant="secondary" 
                    className="backdrop-blur-sm bg-background/80"
                    style={{ 
                      borderColor: project.category.color || undefined,
                      color: project.category.color || undefined 
                    }}
                  >
                    {project.category.name}
                  </Badge>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                <div className="flex items-center gap-2 bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">View Details</span>
                </div>
              </div>

              {/* View Count */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                <Eye className="w-3 h-3" />
                {project.viewCount?.toLocaleString() || 0}
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Title */}
              <h3 className="text-xl font-bold group-hover:text-primary transition-colors duration-300 line-clamp-1">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                {project.shortDescription || project.description}
              </p>

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.slice(0, 4).map((tech, i) => (
                    <Badge 
                      key={tech} 
                      variant="outline" 
                      className="text-xs font-normal transition-all duration-300 hover:bg-primary/10 hover:border-primary/30"
                      style={{ 
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      {tech}
                    </Badge>
                  ))}
                  {project.technologies.length > 4 && (
                    <Badge variant="outline" className="text-xs font-normal">
                      +{project.technologies.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* Links */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                {project.projectUrl && (
                  <span
                    onClick={(e) => handleExternalLink(e, project.projectUrl!)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Demo</span>
                  </span>
                )}
                {project.githubUrl && (
                  <span
                    onClick={(e) => handleExternalLink(e, project.githubUrl!)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
                  >
                    <Github className="w-4 h-4" />
                    <span>Source Code</span>
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}
