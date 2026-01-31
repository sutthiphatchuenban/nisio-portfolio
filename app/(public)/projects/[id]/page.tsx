import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Github, Globe } from "lucide-react"
import { ImageCarousel } from "@/components/shared/ImageCarousel"
import ReactMarkdown from "react-markdown"
import type { Project } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

// Generate dynamic metadata for each project
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    
    const project = await prisma.project.findUnique({
        where: { id },
        include: { category: true }
    })

    if (!project) {
        return {
            title: "Project Not Found",
        }
    }

    const imageUrl = project.images.length > 0 
        ? project.images[0] 
        : project.imageUrl || `${siteConfig.url}/og-image.png`

    return {
        title: project.title,
        description: project.shortDescription || project.description.slice(0, 160),
        keywords: [
            ...project.technologies,
            project.category?.name || "",
            "project",
            "portfolio",
            "web development",
            ...siteConfig.keywords,
        ].filter(Boolean),
        alternates: {
            canonical: getAbsoluteUrl(`/projects/${project.id}`),
        },
        openGraph: {
            title: project.title,
            description: project.shortDescription || project.description.slice(0, 160),
            url: getAbsoluteUrl(`/projects/${project.id}`),
            type: "article",
            publishedTime: project.createdAt.toISOString(),
            modifiedTime: project.updatedAt.toISOString(),
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: project.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: project.title,
            description: project.shortDescription || project.description.slice(0, 160),
            images: [imageUrl],
        },
    }
}

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

// JSON-LD Structured Data for Project
function ProjectJsonLd({ project }: { project: Project }) {
    const imageUrl = project.images.length > 0 
        ? project.images[0] 
        : project.imageUrl || `${siteConfig.url}/og-image.png`

    const projectSchema = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": project.title,
        "description": project.shortDescription || project.description,
        "image": imageUrl,
        "url": getAbsoluteUrl(`/projects/${project.id}`),
        "dateCreated": project.createdAt,
        "dateModified": project.updatedAt,
        "author": {
            "@type": "Person",
            "name": siteConfig.author.name,
            "url": siteConfig.url,
        },
        "keywords": project.technologies.join(", "),
        "genre": project.category?.name || "Software",
        "codeRepository": project.githubUrl,
        "isAccessibleForFree": true,
    }

    const softwareAppSchema = project.projectUrl ? {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": project.title,
        "description": project.shortDescription || project.description,
        "applicationCategory": "WebApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
        },
        "url": project.projectUrl,
        "screenshot": imageUrl,
        "softwareVersion": "1.0",
        "author": {
            "@type": "Person",
            "name": siteConfig.author.name,
        },
    } : null

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }}
            />
            {softwareAppSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
                />
            )}
        </>
    )
}

export default async function ProjectDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const project = await getProject(params.id)

    if (!project) {
        notFound()
    }

    return (
        <>
            <ProjectJsonLd project={project} />
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
        </>
    )
}
