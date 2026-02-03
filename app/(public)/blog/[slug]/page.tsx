import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CalendarDays, Clock, Eye } from "lucide-react"
import { ImageCarousel } from "@/components/shared/ImageCarousel"
import { ClickableImage } from "@/components/ui/clickable-image"
import ReactMarkdown from "react-markdown"
import type { BlogPost } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

// Generate dynamic metadata for each blog post
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const decodedSlug = decodeURIComponent(slug)
    
    const post = await prisma.blogPost.findUnique({
        where: { slug: decodedSlug }
    })

    if (!post || !post.published) {
        return {
            title: "Post Not Found",
        }
    }

    const imageUrl = post.images && post.images.length > 0 
        ? post.images[0] 
        : post.coverImage || `${siteConfig.url}/og-image.png`

    return {
        title: post.title,
        description: post.excerpt || `Read ${post.title} on ${siteConfig.name}`,
        keywords: [
            ...post.tags,
            "blog",
            "article",
            "tutorial",
            "web development",
            ...siteConfig.keywords,
        ],
        authors: [{ name: siteConfig.author.name }],
        alternates: {
            canonical: getAbsoluteUrl(`/blog/${post.slug}`),
        },
        openGraph: {
            title: post.title,
            description: post.excerpt || ``,
            url: getAbsoluteUrl(`/blog/${post.slug}`),
            type: "article",
            publishedTime: (post.publishedAt || post.createdAt).toISOString(),
            modifiedTime: post.updatedAt.toISOString(),
            authors: [siteConfig.author.name],
            tags: post.tags,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.excerpt || ``,
            images: [imageUrl],
        },
    }
}

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

// JSON-LD Structured Data for Blog Post
function BlogPostJsonLd({ post }: { post: BlogPost }) {
    const imageUrl = post.images && post.images.length > 0 
        ? post.images[0]
        : post.coverImage || `${siteConfig.url}/hero_bg.jpg`

    const blogPostSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.excerpt || ``,
        "image": imageUrl,
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt,
        "author": {
            "@type": "Person",
            "name": siteConfig.author.name,
            "url": siteConfig.url,
        },
        "publisher": {
            "@type": "Organization",
            "name": siteConfig.name,
            "logo": {
                "@type": "ImageObject",
                "url": `${siteConfig.url}/hero_bg.jpg`,
            },
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": getAbsoluteUrl(`/blog/${post.slug}`),
        },
        "keywords": post.tags.join(", "),
        "articleSection": "Technology",
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostSchema) }}
        />
    )
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params
    const post = await getBlogPost(params.slug)

    if (!post || !post.published) {
        notFound()
    }

    const relatedPosts = await getRelatedPosts(post.slug, post.tags)

    return (
        <>
            <BlogPostJsonLd post={post} />
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
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <ReactMarkdown>{post.content}</ReactMarkdown>
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
        </>
    )
}
