import Link from "next/link"
import { BlogPost } from "@/types"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, ArrowRight } from "lucide-react"

interface BlogPostCardProps {
    post: BlogPost
    priority?: boolean
}

export function BlogPostCard({ post, priority = false }: BlogPostCardProps) {
    const formattedDate = post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

    return (
        <Link href={`/blog/${post.slug}`} className="group block h-full">
            <Card className="h-full flex flex-col overflow-hidden theme-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                {/* Cover Image */}
                {post.coverImage ? (
                    <div className="aspect-video w-full overflow-hidden">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            loading={priority ? "eager" : "lazy"}
                        />
                    </div>
                ) : (
                    <div className="aspect-video w-full bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No cover image</span>
                    </div>
                )}

                <CardHeader className="pb-2">
                    <h3 className="font-bold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {post.title}
                    </h3>
                </CardHeader>

                <CardContent className="flex-grow pb-2">
                    <p className="text-muted-foreground text-sm line-clamp-3 group-hover:text-foreground/80 transition-colors">
                        {post.excerpt || post.content.replace(/[#*`]/g, '').slice(0, 150) + '...'}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                            {post.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                            {post.tags.length > 3 && (
                                <span className="text-xs px-2 py-1 text-muted-foreground">
                                    +{post.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                            <Calendar className="w-3 h-3" />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                            <Eye className="w-3 h-3" />
                            {post.viewCount}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 group-hover:translate-x-1 transition-all duration-300">
                        Read <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    )
}
