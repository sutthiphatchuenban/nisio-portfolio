import prisma from "@/lib/prisma"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Github, Linkedin, Twitter, Mail, MapPin, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Skill } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"
import { getSiteSettings } from "@/lib/settings"

// SEO Metadata for About Page
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    const name = settings?.name || siteConfig.author.name
    const title = settings?.title || "Full Stack Developer"
    
    return {
        title: "About",
        description: `Learn more about ${name}, ${title}. Discover my skills, experience, and passion for web development.`,
        keywords: [
            "about",
            "about me",
            "developer bio",
            "web developer profile",
            "software engineer",
            "full stack developer",
            "frontend developer",
            "backend developer",
            "programmer",
            "coder",
            ...siteConfig.keywords,
        ],
        alternates: {
            canonical: getAbsoluteUrl("/about"),
        },
        openGraph: {
            title: `About | ${siteConfig.name}`,
            description: `Learn more about ${name}, ${title}.`,
            url: getAbsoluteUrl("/about"),
            type: "profile",
            images: [
                {
                    url: settings?.avatar || "/og-image.png",
                    width: 1200,
                    height: 630,
                    alt: `${name} - ${title}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `About | ${siteConfig.name}`,
            description: `Learn more about ${name}, ${title}.`,
            images: [settings?.avatar || "/og-image.png"],
        },
    }
}

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

// JSON-LD Structured Data Component
function JsonLd({ settings, skills }: { settings: any, skills: Skill[] }) {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": settings.name,
        "jobTitle": settings.title,
        "description": settings.bio,
        "url": getAbsoluteUrl("/about"),
        "image": settings.avatar,
        "sameAs": [
            settings.githubUrl,
            settings.linkedinUrl,
            settings.twitterUrl,
        ].filter(Boolean),
        "knowsAbout": skills.map(skill => skill.name),
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        },
        "address": settings.location ? {
            "@type": "PostalAddress",
            "addressLocality": settings.location,
        } : undefined,
    }

    const profilePageSchema = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        "name": `About ${settings.name}`,
        "description": settings.bio,
        "url": getAbsoluteUrl("/about"),
        "mainEntity": {
            "@type": "Person",
            "name": settings.name,
        },
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(profilePageSchema) }}
            />
        </>
    )
}

export default async function AboutPage() {
    const settings = await getSettings()
    const skills = await getSkills()

    return (
        <>
            <JsonLd settings={settings} skills={skills} />
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
                                                unoptimized={true}
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
                                            <Link href={settings.githubUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="icon">
                                                    <Github className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {settings.linkedinUrl && (
                                            <Link href={settings.linkedinUrl} target="_blank" rel="noopener noreferrer">
                                                <Button variant="outline" size="icon">
                                                    <Linkedin className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                        {settings.twitterUrl && (
                                            <Link href={settings.twitterUrl} target="_blank" rel="noopener noreferrer">
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
                                        <Link href={settings.resumeUrl} target="_blank" rel="noopener noreferrer" className="mt-4 w-full">
                                            <Button className="w-full" variant="outline">
                                                <FileText className="h-4 w-4 mr-2" />
                                                Download Resume
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bio & Skills */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Bio Section */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">About Me</h2>
                            {settings.bio ? (
                                <div className="prose prose-zinc dark:prose-invert max-w-none">
                                    <ReactMarkdown>{settings.bio}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">
                                    No bio available yet.
                                </p>
                            )}
                        </section>

                        {/* Skills Section */}
                        {skills.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold mb-4">Skills & Technologies</h2>
                                <div className="flex flex-wrap gap-2">
                                    {skills.map((skill) => (
                                        <Badge key={skill.id} variant="secondary" className="text-sm px-3 py-1">
                                            {skill.icon && <span className="mr-1">{skill.icon}</span>}
                                            {skill.name}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Contact CTA */}
                        <section className="bg-muted/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold mb-2">Let's Work Together</h2>
                            <p className="text-muted-foreground mb-4">
                                I'm always interested in hearing about new projects and opportunities.
                            </p>
                            <Link href="/contact">
                                <Button>
                                    Get in Touch
                                    <ExternalLink className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}
