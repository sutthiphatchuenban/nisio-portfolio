import prisma from "@/lib/prisma"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Twitter, Mail, MapPin, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import type { Skill } from "@/types"

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 0

async function getSettings() {
    let settings = await prisma.siteSettings.findUnique({
        where: { id: 'default' }
    })

    if (!settings) {
        settings = await prisma.siteSettings.create({
            data: {
                id: 'default',
                name: 'Your Name',
                title: 'Full Stack Developer',
                bio: 'I am a passionate developer with expertise in modern web technologies.',
            }
        })
    }

    return settings
}

async function getSkills(): Promise<Skill[]> {
    const skills = await prisma.skill.findMany({
        orderBy: { orderIndex: 'asc' },
        take: 12
    })
    return skills as Skill[]
}

export default async function AboutPage() {
    const settings = await getSettings()
    const skills = await getSkills()

    return (
        <div className="container py-10">
            <div className="grid gap-10 lg:grid-cols-3">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-24">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center text-center">
                                {/* Avatar */}
                                <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg">
                                    {settings.avatar ? (
                                        <Image
                                            src={settings.avatar}
                                            alt={settings.name}
                                            fill
                                            sizes="128px"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                                            {settings.name.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold">{settings.name}</h1>
                                <p className="text-muted-foreground">{settings.title}</p>

                                {settings.location && (
                                    <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4" />
                                        {settings.location}
                                    </div>
                                )}

                                {/* Social Links */}
                                <div className="flex gap-2 mt-4">
                                    {settings.githubUrl && (
                                        <Link href={settings.githubUrl} target="_blank">
                                            <Button variant="outline" size="icon">
                                                <Github className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    {settings.linkedinUrl && (
                                        <Link href={settings.linkedinUrl} target="_blank">
                                            <Button variant="outline" size="icon">
                                                <Linkedin className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    {settings.twitterUrl && (
                                        <Link href={settings.twitterUrl} target="_blank">
                                            <Button variant="outline" size="icon">
                                                <Twitter className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                    {settings.email && (
                                        <Link href={`mailto:${settings.email}`}>
                                            <Button variant="outline" size="icon">
                                                <Mail className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                {/* Resume Button */}
                                {settings.resumeUrl && (
                                    <Link href={settings.resumeUrl} target="_blank" className="w-full mt-4">
                                        <Button className="w-full">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Download Resume
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Bio */}
                    <section>
                        <h2 className="text-3xl font-bold mb-4">About Me</h2>
                        <div className="prose dark:prose-invert max-w-none">
                            {settings.bio ? (
                                <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                                    {settings.bio}
                                </p>
                            ) : (
                                <p className="text-muted-foreground">No bio yet.</p>
                            )}
                        </div>
                    </section>

                    {/* Skills */}
                    {skills.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Skills & Technologies</h2>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill) => (
                                    <Badge
                                        key={skill.id}
                                        variant="secondary"
                                        className="px-3 py-1 text-sm"
                                    >
                                        {skill.icon && (
                                            <img src={skill.icon} alt="" className="w-4 h-4 mr-2" />
                                        )}
                                        {skill.name}
                                    </Badge>
                                ))}
                            </div>
                            <Link href="/skills" className="inline-block mt-4">
                                <Button variant="outline" size="sm">
                                    View All Skills <ExternalLink className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </section>
                    )}

                    {/* CTA */}
                    <section className="bg-muted/50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-2">Let's Work Together</h3>
                        <p className="text-muted-foreground mb-4">
                            Have a project in mind? I'd love to hear about it.
                        </p>
                        <Link href="/contact">
                            <Button>Get in Touch</Button>
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    )
}
