import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Github, Globe } from "lucide-react"
import { ImageCarousel } from "@/components/shared/ImageCarousel"
import ReactMarkdown from "react-markdown"
import type { Project } from "@/types"

// Disable caching - always fetch fresh data from database
export const revalidate = 0

async function getProject(id: string) {
    const project = await prisma.project.findUnique({
        where: { id },
        include: { category: true }
    })

    // Increment view count (Simple server-side mutation without API call for optimization)
    if (project) {
        await prisma.project.update({
            where: { id },
            data: { viewCount: { increment: 1 } }
        })
    }

    return project as unknown as Project | null
}

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const project = await getProject(params.id)

    if (!project) {
        notFound()
    }

    return (
        <div className="container py-10 max-w-4xl">
            <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to projects
            </Link>

            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{project.title}</h1>
                    <div className="flex flex-wrap gap-2 items-center text-muted-foreground">
                        {project.category && <Badge>{project.category.name}</Badge>}
                        <span>•</span>
                        <span>{project.viewCount} views</span>
                        <span>•</span>
                        <span>Published on {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Image Carousel */}
                <ImageCarousel
                    images={project.images.length > 0 ? project.images : (project.imageUrl ? [project.imageUrl] : [])}
                    title={project.title}
                />

                <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
                    <div className="space-y-6">
                        <div className="prose dark:prose-invert max-w-none">
                            <h3 className="text-xl font-semibold mb-2">About the Project</h3>
                            <div className="border-l-2 pl-4 border-muted leading-relaxed">
                                <ReactMarkdown>
                                    {project.description}
                                </ReactMarkdown>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-semibold">Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.technologies.map(tech => (
                                    <Badge key={tech} variant="secondary">{tech}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="rounded-lg border bg-card p-4 space-y-4">
                            <h3 className="font-semibold">Links</h3>
                            <div className="grid gap-2">
                                {project.projectUrl && (
                                    <Button asChild className="w-full">
                                        <a href={project.projectUrl} target="_blank" rel="noreferrer">
                                            <Globe className="mr-2 h-4 w-4" />
                                            Live Demo
                                        </a>
                                    </Button>
                                )}
                                {project.githubUrl && (
                                    <Button asChild variant="outline" className="w-full">
                                        <a href={project.githubUrl} target="_blank" rel="noreferrer">
                                            <Github className="mr-2 h-4 w-4" />
                                            Source Code
                                        </a>
                                    </Button>
                                )}
                                {!project.projectUrl && !project.githubUrl && (
                                    <div className="text-sm text-muted-foreground text-center py-2">No links available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
