import { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"
import prisma from "@/lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = siteConfig.url

    // Static routes
    const staticRoutes = [
        {
            url: `${baseUrl}/`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 1.0,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/projects`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: "daily" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/skills`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.6,
        },
    ]

    // Fetch dynamic routes - Projects
    let projectRoutes: MetadataRoute.Sitemap = []
    try {
        const projects = await prisma.project.findMany({
            select: { id: true, updatedAt: true },
        })
        projectRoutes = projects.map((project) => ({
            url: `${baseUrl}/projects/${project.id}`,
            lastModified: project.updatedAt,
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }))
    } catch (error) {
        console.error("Failed to fetch projects for sitemap:", error)
    }

    // Fetch dynamic routes - Blog Posts
    let blogRoutes: MetadataRoute.Sitemap = []
    try {
        const posts = await prisma.blogPost.findMany({
            where: { published: true },
            select: { slug: true, updatedAt: true },
        })
        blogRoutes = posts.map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        }))
    } catch (error) {
        console.error("Failed to fetch blog posts for sitemap:", error)
    }

    return [...staticRoutes, ...projectRoutes, ...blogRoutes]
}
