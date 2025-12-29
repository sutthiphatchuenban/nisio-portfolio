import Hero from "@/components/home/Hero"
import { ProjectCard } from "@/components/projects/ProjectCard"
import prisma from "@/lib/prisma"
import type { Project, Skill } from "@/types"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

// Disable caching - always fetch fresh data from database
export const revalidate = 0

async function getFeaturedProjects() {
    const projects = await prisma.project.findMany({
        where: { featured: true },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { category: true }
    })
    return projects as unknown as Project[]
}

async function getSkills() {
    const skills = await prisma.skill.findMany({
        orderBy: { orderIndex: 'asc' },
        take: 8
    })
    return skills as unknown as Skill[]
}

export default async function HomePage() {
    const featuredProjects = await getFeaturedProjects()
    const skills = await getSkills()

    return (
        <div className="container">
            <Hero />

            {/* Featured Projects Section */}
            <section className="py-16">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
                        <p className="text-muted-foreground mt-1">
                            Highlighted work from my portfolio
                        </p>
                    </div>
                    <Link href="/projects">
                        <Button variant="ghost">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {featuredProjects.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/30">
                        <p>No featured projects yet.</p>
                        <p className="text-sm mt-1">Mark projects as "Featured" in the admin panel.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredProjects.map((project, index) => (
                            <ProjectCard key={project.id} project={project} priority={index < 3} />
                        ))}
                    </div>
                )}
            </section>

            {/* Skills Preview Section */}
            <section className="py-16 border-t">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Skills & Technologies</h2>
                        <p className="text-muted-foreground mt-1">
                            Tools and technologies I work with
                        </p>
                    </div>
                    <Link href="/skills">
                        <Button variant="ghost">
                            View All <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {skills.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg bg-muted/30">
                            <p>No skills added yet.</p>
                        </div>
                    ) : (
                        skills.map((skill) => (
                            <div key={skill.id} className="flex items-center gap-3 p-4 rounded-lg border bg-card hover:bg-accent transition-all theme-card">
                                {skill.icon ? (
                                    <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                )}
                                <span className="font-medium">{skill.name}</span>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 border-t">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Let's Work Together</h2>
                    <p className="text-muted-foreground mb-6">
                        Have a project in mind? I'd love to hear about it. Get in touch and let's create something amazing.
                    </p>
                    <Link href="/contact">
                        <Button size="lg">
                            Get in Touch <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    )
}
