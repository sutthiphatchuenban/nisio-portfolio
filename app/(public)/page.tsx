import Hero from "@/components/home/Hero"
import AnimatedProjectCard from "@/components/projects/AnimatedProjectCard"
import AnimatedBlogCard from "@/components/blog/AnimatedBlogCard"
import AnimatedSkillCard from "@/components/skills/AnimatedSkillCard"
import prisma from "@/lib/prisma"
import type { Project, Skill, BlogPost } from "@/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Code2, PenTool, Wrench, Mail } from "lucide-react"

// Disable caching - always fetch fresh data from database
export const revalidate = 0

async function getFeaturedProjects() {
    try {
        const projects = await prisma.project.findMany({
            where: { featured: true },
            orderBy: { createdAt: 'desc' },
            take: 6,
            include: { category: true }
        })
        return projects as unknown as Project[]
    } catch (error) {
        console.error('Failed to fetch featured projects:', error)
        return []
    }
}

async function getFeaturedBlogPosts() {
    try {
        const posts = await prisma.blogPost.findMany({
            where: { published: true, featured: true },
            orderBy: { publishedAt: 'desc' },
            take: 4
        })
        return posts as unknown as BlogPost[]
    } catch (error) {
        console.error('Failed to fetch featured blog posts:', error)
        return []
    }
}

async function getSkills() {
    try {
        const skills = await prisma.skill.findMany({
            orderBy: { proficiency: 'desc' },
            take: 8
        })
        return skills as unknown as Skill[]
    } catch (error) {
        console.error('Failed to fetch skills:', error)
        return []
    }
}

// Section Header Component
function SectionHeader({ 
    icon: Icon, 
    title, 
    subtitle, 
    href,
    delay = 0 
}: { 
    icon: typeof Sparkles
    title: string
    subtitle: string
    href: string
    delay?: number
}) {
    return (
        <div 
            className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12 animate-fade-in-up"
            style={{ animationDelay: `${delay}s` }}
        >
            <div className="space-y-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                        {title}
                    </h2>
                </div>
                <p className="text-muted-foreground text-lg max-w-xl">
                    {subtitle}
                </p>
            </div>
            <Link href={href}>
                <Button 
                    variant="ghost" 
                    className="group text-primary hover:text-primary hover:bg-primary/10"
                >
                    View All
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </Link>
        </div>
    )
}

// CTA Section
function CTASection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 gradient-mesh opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
            
            {/* Floating Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-primary/10 blur-2xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            
            <div className="container relative z-10">
                <div className="max-w-3xl mx-auto text-center space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in-up">
                        <Mail className="w-4 h-4" />
                        Let's Connect
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        Ready to Build Something
                        <span className="hero-gradient block mt-2">Amazing Together?</span>
                    </h2>
                    
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        Have a project in mind? I'd love to hear about it. 
                        Let's discuss how we can turn your ideas into reality.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                        <Link href="/contact">
                            <Button 
                                size="lg" 
                                className="group relative overflow-hidden rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/25"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Get in Touch
                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2s_infinite]" />
                            </Button>
                        </Link>
                        <Link href="/projects">
                            <Button 
                                variant="outline" 
                                size="lg" 
                                className="rounded-full px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 border-2"
                            >
                                View My Work
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Main Page Component
export default async function HomePage() {
    const featuredProjects = await getFeaturedProjects()
    const featuredBlogPosts = await getFeaturedBlogPosts()
    const skills = await getSkills()

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <Hero />

            {/* Featured Blog Posts Section */}
            {featuredBlogPosts.length > 0 && (
                <section className="py-24 relative">
                    <div className="container">
                        <SectionHeader 
                            icon={PenTool}
                            title="Latest Articles"
                            subtitle="Thoughts, tutorials, and insights from my journey as a developer"
                            href="/blog"
                            delay={0.1}
                        />

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredBlogPosts.map((post, index) => (
                                <AnimatedBlogCard 
                                    key={post.id} 
                                    post={post} 
                                    priority={index < 3}
                                    index={index}
                                    featured={index === 0}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Featured Projects Section */}
            <section className="py-24 relative bg-muted/30">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.02]">
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                            backgroundSize: '40px 40px',
                        }}
                    />
                </div>

                <div className="container relative z-10">
                    <SectionHeader 
                        icon={Code2}
                        title="Featured Projects"
                        subtitle="A selection of my best work, showcasing creativity and technical expertise"
                        href="/projects"
                        delay={0.1}
                    />

                    {featuredProjects.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
                            <div className="text-6xl mb-4">🚀</div>
                            <p className="text-xl font-medium">No featured projects yet</p>
                            <p className="text-sm mt-2">Mark projects as "Featured" in the admin panel</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {featuredProjects.map((project, index) => (
                                <AnimatedProjectCard 
                                    key={project.id} 
                                    project={project} 
                                    priority={index < 3}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Skills Section */}
            <section className="py-24 relative">
                <div className="container">
                    <SectionHeader 
                        icon={Wrench}
                        title="Skills & Technologies"
                        subtitle="Tools and technologies I use to bring ideas to life"
                        href="/skills"
                        delay={0.1}
                    />

                    {skills.length === 0 ? (
                        <div className="text-center py-20 text-muted-foreground border-2 border-dashed rounded-2xl bg-muted/30">
                            <div className="text-6xl mb-4">🛠️</div>
                            <p className="text-xl font-medium">No skills added yet</p>
                            <p className="text-sm mt-2">Add your skills in the admin panel</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {skills.map((skill, index) => (
                                <AnimatedSkillCard 
                                    key={skill.id} 
                                    skill={skill}
                                    index={index}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <CTASection />
        </div>
    )
}
