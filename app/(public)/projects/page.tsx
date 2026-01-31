import { ProjectCard } from "@/components/projects/ProjectCard"
import prisma from "@/lib/prisma"
import type { Project, Category } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

// SEO Metadata for Projects Page
export const metadata: Metadata = {
    title: "Projects",
    description: `Explore my portfolio of web development projects. A collection of work ranging from web applications to open source libraries built with modern technologies.`,
    keywords: [
        "projects",
        "portfolio projects",
        "web development projects",
        "software projects",
        "github projects",
        "javascript projects",
        "react projects",
        "nextjs projects",
        "full stack projects",
        ...siteConfig.keywords,
    ],
    alternates: {
        canonical: getAbsoluteUrl("/projects"),
    },
    openGraph: {
        title: `Projects | ${siteConfig.name}`,
        description: "Explore my portfolio of web development projects showcasing creativity and technical expertise.",
        url: getAbsoluteUrl("/projects"),
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: `${siteConfig.name} - Projects`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `Projects | ${siteConfig.name}`,
        description: "Explore my portfolio of web development projects showcasing creativity and technical expertise.",
        images: ["/og-image.png"],
    },
}

// Disable caching - always fetch fresh data from database
export const revalidate = 0

async function getProjects() {
    const projects = await prisma.project.findMany({
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    })
    return projects as unknown as Project[]
}

export default async function ProjectsPage() {
    const projects = await getProjects()

    return (
        <div className="container py-10">
            <div className="flex flex-col items-center gap-4 text-center mb-10">
                <h1 className="text-4xl font-bold font-heading">Projects</h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                    A collection of projects I've worked on, ranging from web applications to open source libraries.
                </p>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    No projects found. Check back later!
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project, index) => (
                        <ProjectCard key={project.id} project={project} priority={index < 3} />
                    ))}
                </div>
            )}
        </div>
    )
}
