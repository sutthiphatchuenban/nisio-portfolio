import Hero from "@/components/home/Hero"
import HomeContent from "@/components/home/HomeContent"
import prisma from "@/lib/prisma"
import type { Project, Skill, BlogPost, Video } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"
import { getSiteSettings } from "@/lib/settings"
// SEO Metadata for Home Page
export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings()
    const siteName = settings.siteName || siteConfig.name
    const description = settings.siteDescription || siteConfig.description
    const ogImage = (settings as any)?.heroImage || siteConfig.ogImage || "/og-image.png"
    const thaiName = "สุทธิภัทร ชื่นบาน"
    const englishName = "Sutthiphat Chuenban"

    return {
        title: {
            absolute: `${siteName} - ${thaiName} (${englishName}) | Full Stack Developer Portfolio`,
        },
        description: `${description} | ${thaiName} (${englishName}) - Full Stack Developer`,
        keywords: [
            ...siteConfig.keywords,
            "portfolio website",
            "developer portfolio",
            "web developer portfolio",
            "software engineer portfolio",
            "creative developer",
            thaiName,
            englishName,
        ],
        alternates: {
            canonical: getAbsoluteUrl("/"),
        },
        openGraph: {
            title: `${siteName} - ${thaiName} (${englishName})`,
            description: `${description} | ${thaiName} (${englishName})`,
            url: getAbsoluteUrl("/"),
            type: "website",
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: `${siteName} - ${thaiName}`,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: `${siteName} - ${thaiName} (${englishName})`,
            description: `${description} | ${thaiName} (${englishName})`,
            images: [ogImage],
        },
    }
}

// No caching - always fetch fresh data from database
export const revalidate = 0

async function getHomePageData() {
    try {
        const fetchPromise = Promise.all([
            // Featured Projects
            prisma.project.findMany({
                where: { featured: true, status: 'published' },
                orderBy: { createdAt: 'desc' },
                take: 6,
                include: { category: true }
            }),
            // Featured Blog Posts
            prisma.blogPost.findMany({
                where: { published: true, featured: true },
                orderBy: { publishedAt: 'desc' },
                take: 4
            }),
            // Skills
            prisma.skill.findMany({
                orderBy: { proficiency: 'desc' },
                take: 8
            }),
            // Settings
            prisma.siteSettings.findUnique({
                where: { id: 'default' }
            }),
            // Featured Videos
            prisma.video.findMany({
                where: { published: true, featured: true },
                orderBy: { createdAt: 'desc' },
                take: 4,
                include: { category: true }
            }),
        ])

        const [projects, posts, skills, settings, videos] = await Promise.race([
            fetchPromise,
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Database query timeout')), 2500)
            ),
        ])

        return {
            projects: projects as unknown as Project[],
            posts: posts as unknown as BlogPost[],
            skills: skills as unknown as Skill[],
            videos: videos as unknown as Video[],
            settings
        }
    } catch (error) {
        console.warn('Database connection unavailable, using fallback data:', (error as Error).message)
        return {
            projects: [],
            posts: [],
            skills: [],
            videos: [],
            settings: {
                id: 'default',
                siteName: 'PORTX',
                siteDescription: 'Personal portfolio website',
                name: 'Sutthiphat Chuenban',
                title: 'Full Stack Developer',
                bio: 'Passionate developer creating modern web applications.',
                avatar: null,
                heroImage: null,
                heroImageMobile: null,
                email: 'sutthiphatchuenban@gmail.com',
                location: 'Thailand',
                resumeUrl: null,
                githubUrl: null,
                linkedinUrl: null,
                twitterUrl: null,
                updatedAt: new Date(),
            } as any
        }
    }
}

// JSON-LD Structured Data Component
function JsonLd({ settings, projects }: { settings: any, projects: Project[] }) {
    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": settings?.name || siteConfig.author.name,
        "jobTitle": settings?.title || "Full Stack Developer",
        "description": settings?.bio || siteConfig.description,
        "url": siteConfig.url,
        "sameAs": [
            settings?.githubUrl || siteConfig.social.github,
            settings?.linkedinUrl || siteConfig.social.linkedin,
            settings?.twitterUrl || siteConfig.social.twitter,
        ].filter(Boolean),
        "image": settings?.avatar || `${siteConfig.url}/hero_bg.jpg`,
        "worksFor": {
            "@type": "Organization",
            "name": "Freelance"
        },
    }

    const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": settings?.siteName || siteConfig.name,
        "description": settings?.siteDescription || siteConfig.description,
        "url": siteConfig.url,
        "potentialAction": {
            "@type": "SearchAction",
            "target": {
                "@type": "EntryPoint",
                "urlTemplate": `${siteConfig.url}/search?q={search_term_string}`
            },
            "query-input": "required name=search_term_string"
        }
    }

    const portfolioSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Portfolio - ${settings?.siteName || siteConfig.name}`,
        "description": `Featured projects by ${settings?.name || siteConfig.author.name}`,
        "url": `${siteConfig.url}/projects`,
        "hasPart": projects.slice(0, 6).map((project) => ({
            "@type": "CreativeWork",
            "name": project.title,
            "description": project.description,
            "url": `${siteConfig.url}/projects/${project.id}`,
            "image": project.imageUrl || (project.images && project.images[0]) || `${siteConfig.url}/hero_bg.jpg`,
        })),
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioSchema) }}
            />
        </>
    )
}

export default async function HomePage() {
    const { projects, posts, skills, settings, videos } = await getHomePageData()
    return <>
        <JsonLd settings={settings} projects={projects} />
        <Hero heroImage={(settings as any)?.heroImage} heroImageMobile={(settings as any)?.heroImageMobile} name={settings?.name} title={settings?.title} />
        <HomeContent posts={posts} projects={projects} videos={videos} skills={skills} />
    </>
}
