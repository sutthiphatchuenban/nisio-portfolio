import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, Clock, Eye } from "lucide-react"
import { ImageCarousel } from "@/components/shared/ImageCarousel"
import { ClickableImage } from "@/components/ui/clickable-image"
import type { BlogPost } from "@/types"

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 0

async function getBlogPost(slug: string) {
    // URL-encoded Thai characters might come in as %E0...
    // We should decode it to get the actual Thai characters for database matching
    const decodedSlug = decodeURIComponent(slug)

    let post = await prisma.blogPost.findUnique({
        where: { slug: decodedSlug }
    })

    // Fallback to original slug if decoded didn't work (though usually decoded is what's in DB)
    if (!post && decodedSlug !== slug) {
        post = await prisma.blogPost.findUnique({
            where: { slug }
        })
    }

    if (post && post.published) {
        // Increment view count using ID for reliability
        await prisma.blogPost.update({
            where: { id: post.id },
            data: { viewCount: { increment: 1 } }
        })
    }

    return post as unknown as BlogPost | null
}

async function getRelatedPosts(currentSlug: string, tags: string[]) {
    if (tags.length === 0) return []

    const posts = await prisma.blogPost.findMany({
        where: {
            published: true,
            slug: { not: currentSlug },
            tags: { hasSome: tags }
        },
        take: 3,
        orderBy: { createdAt: 'desc' }
    })

    return posts as unknown as BlogPost[]
}

function estimateReadTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const post = await getBlogPost(params.slug)

    if (!post || !post.published) {
        notFound()
    }

    const relatedPosts = await getRelatedPosts(post.slug, post.tags)

    return (
        <div className="container py-10 max-w-4xl">
            <Link href="/blog" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
            </Link>

            <article className="space-y-8">
                {/* Header */}
                <header className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">{post.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {estimateReadTime(post.content)} min read
                        </span>
                        <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {post.viewCount} views
                        </span>
                    </div>
                </header>

                {/* Image Carousel - Support multiple images like projects */}
                <ImageCarousel
                    images={post.images && post.images.length > 0 ? post.images : (post.coverImage ? [post.coverImage] : [])}
                    title={post.title}
                />

                {/* Content */}
                <div className="prose dark:prose-invert max-w-none">
                    {post.content.split('\n').map((paragraph, i) => {
                        if (paragraph.startsWith('# ')) {
                            return <h1 key={i}>{paragraph.slice(2)}</h1>
                        }
                        if (paragraph.startsWith('## ')) {
                            return <h2 key={i}>{paragraph.slice(3)}</h2>
                        }
                        if (paragraph.startsWith('### ')) {
                            return <h3 key={i}>{paragraph.slice(4)}</h3>
                        }
                        if (paragraph.startsWith('- ')) {
                            return <li key={i}>{paragraph.slice(2)}</li>
                        }
                        if (paragraph.startsWith('```')) {
                            return <pre key={i} className="bg-muted p-4 rounded-lg overflow-x-auto"><code>{paragraph.slice(3)}</code></pre>
                        }
                        if (paragraph.trim() === '') {
                            return <br key={i} />
                        }
                        return <p key={i}>{paragraph}</p>
                    })}
                </div>

                {/* Share / Back */}
                <div className="flex items-center justify-between pt-8 border-t">
                    <Link href="/blog">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Blog
                        </Button>
                    </Link>
                </div>
            </article>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <section className="mt-16">
                    <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {relatedPosts.map((relatedPost) => (
                            <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`}>
                                <div className="group rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                                    {(relatedPost.images && relatedPost.images.length > 0 ? relatedPost.images[0] : relatedPost.coverImage) && (
                                        <div className="relative aspect-video overflow-hidden">
                                            <ClickableImage
                                                src={relatedPost.images && relatedPost.images.length > 0 ? relatedPost.images[0] : relatedPost.coverImage!}
                                                alt={relatedPost.title}
                                                sizes="33vw"
                                            />
                                        </div>
                                    )}
                                    <div className="p-4">
                                        <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                            {relatedPost.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {new Date(relatedPost.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
