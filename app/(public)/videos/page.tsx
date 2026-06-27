import prisma from "@/lib/prisma"
import type { Video, VideoCategory } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"
import { getSiteSettings } from "@/lib/settings"
import { VideoList } from "./VideoList"

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    const ogImage = (settings as any)?.heroImage || "/hero_bg.jpg"

    return {
        title: "Videos",
        description: "Watch video tutorials, project showcases, and tech talks from my YouTube channel.",
        keywords: [
            "videos",
            "tutorials",
            "youtube",
            "tech talks",
            "programming videos",
            "web development tutorials",
            ...siteConfig.keywords,
        ],
        alternates: {
            canonical: getAbsoluteUrl("/videos"),
        },
        openGraph: {
            title: `Videos | ${siteConfig.name}`,
            description: "Watch video tutorials, project showcases, and tech talks.",
            url: getAbsoluteUrl("/videos"),
            type: "website",
            images: [{ url: ogImage, width: 1200, height: 630, alt: `${siteConfig.name} - Videos` }],
        },
    }
}

export const revalidate = 0

async function getVideos() {
    const videos = await prisma.video.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        include: { category: true }
    })
    return videos as unknown as Video[]
}

async function getCategories() {
    const categories = await prisma.videoCategory.findMany({
        orderBy: { name: 'asc' }
    })
    return categories as unknown as VideoCategory[]
}

export default async function VideosPage() {
    const [videos, categories] = await Promise.all([getVideos(), getCategories()])

    return (
        <div className="container py-10">
            <div className="flex flex-col items-center gap-4 text-center mb-10">
                <h1 className="text-4xl font-bold font-heading">Videos</h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                    Video tutorials, project showcases, and tech talks.
                </p>
            </div>

            <VideoList videos={videos} categories={categories} />
        </div>
    )
}
