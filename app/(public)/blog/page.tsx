import prisma from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CalendarDays, Clock, Eye, ArrowRight } from "lucide-react"
import type { BlogPost } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"
import { getSiteSettings } from "@/lib/settings"

// SEO Metadata for Blog Page - Dynamic from database
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    const ogImage = (settings as any)?.heroImage || "/hero_bg.jpg"

    return {
        title: "Blog",
        description: `Read my latest articles about web development, programming tutorials, and insights from my journey as a developer.`,
        keywords: [
            "blog",
            "developer blog",
            "web development blog",
            "programming tutorials",
            "coding blog",
            "tech blog",
            "javascript tutorials",
            "react tutorials",
            "nextjs tutorials",
            "web development tips",
            ...siteConfig.keywords,
        ],
        alternates: {
            canonical: getAbsoluteUrl("/blog"),
        },
        openGraph: {
            title: `Blog | ${siteConfig.name}`,
            description: "Thoughts, tutorials, and insights about web development and programming.",
            url: getAbsoluteUrl("/blog"),
            type: "website",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${siteConfig.name} - Blog`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `Blog | ${siteConfig.name}`,
            description: "Thoughts, tutorials, and insights about web development and programming.",
            images: [ogImage],
        },
    }
}

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 0

async function getBlogPosts() {
    const posts = await prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
    })
    return posts as unknown as BlogPost[]
}

function estimateReadTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
}

export default async function BlogPage() {
    const posts = await getBlogPosts()
    const featuredPosts = posts.filter(p => p.featured)
    const regularPosts = posts.filter(p => !p.featured)

    return (
        <div className="container py-10">
            <div className="space-y-2 mb-8">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">Blog</h1>
                <p className="text-lg text-muted-foreground">
                    Thoughts, tutorials, and insights about web development.
                </p>
            </div>

            {posts.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-muted-foreground">No blog posts yet. Stay tuned!</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {/* Featured Posts */}
                    {featuredPosts.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Featured</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {featuredPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group theme-card hextech-border">
                                            {(post.images && post.images.length > 0 ? post.images[0] : post.coverImage) && (
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={post.images && post.images.length > 0 ? post.images[0] : post.coverImage!}
                                                        alt={post.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized={true}
                                                    />
                                                    <div className="absolute top-2 left-2">
                                                        <Badge className="bg-yellow-500 text-black">Featured</Badge>
                                                    </div>
                                                </div>
                                            )}
                                            <CardHeader>
                                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                            </CardHeader>
                                            <CardContent>
                                                {post.excerpt && (
                                                    <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {post.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="secondary">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="text-sm text-muted-foreground">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {estimateReadTime(post.content)} min read
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Eye className="h-4 w-4" />
                                                        {post.viewCount}
                                                    </span>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Regular Posts */}
                    {regularPosts.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {regularPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group theme-card hextech-border">
                                            {(post.images && post.images.length > 0 ? post.images[0] : post.coverImage) && (
                                                <div className="relative aspect-video overflow-hidden">
                                                    <Image
                                                        src={post.images && post.images.length > 0 ? post.images[0] : post.coverImage!}
                                                        alt={post.title}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                        unoptimized={true}
                                                    />
                                                </div>
                                            )}
                                            <CardHeader>
                                                <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                    {post.title}
                                                </h3>
                                            </CardHeader>
                                            <CardContent>
                                                {post.excerpt && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {post.tags.slice(0, 3).map((tag) => (
                                                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                                    ))}
                                                </div>
                                            </CardContent>
                                            <CardFooter className="text-sm text-muted-foreground">
                                                <div className="flex items-center gap-3">
                                                    <span className="flex items-center gap-1">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-4 w-4" />
                                                        {estimateReadTime(post.content)} min
                                                    </span>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    )
}
