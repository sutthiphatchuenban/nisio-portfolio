import Prisma from "@/lib/prisma"
import { SkillCard } from "@/components/skills/SkillCard"
import type { Skill } from "@/types"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

// SEO Metadata for Skills Page
export const metadata: Metadata = {
    title: "Skills",
    description: `Explore my technical skills and technologies I work with. From frontend to backend, discover the tools I use to build modern web applications.`,
    keywords: [
        "skills",
        "technical skills",
        "programming languages",
        "web technologies",
        "frontend skills",
        "backend skills",
        "javascript",
        "typescript",
        "react",
        "nextjs",
        "node.js",
        "full stack skills",
        "developer tools",
        ...siteConfig.keywords,
    ],
    alternates: {
        canonical: getAbsoluteUrl("/skills"),
    },
    openGraph: {
        title: `Skills | ${siteConfig.name}`,
        description: "Explore my technical skills and the technologies I work with to build modern web applications.",
        url: getAbsoluteUrl("/skills"),
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: `${siteConfig.name} - Skills`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `Skills | ${siteConfig.name}`,
        description: "Explore my technical skills and the technologies I work with to build modern web applications.",
        images: ["/og-image.png"],
    },
}

// Revalidate every 60 seconds for ISR (Incremental Static Regeneration)
export const revalidate = 0

async function getSkills() {
    const skills = await Prisma.skill.findMany({
        orderBy: { orderIndex: 'asc' }
    })
    return skills as unknown as Skill[]
}

export default async function SkillsPage() {
    const skills = await getSkills()

    // Group by category
    const skillsByCategory = skills.reduce((acc, skill) => {
        const category = skill.category || "Other"
        if (!acc[category]) acc[category] = []
        acc[category].push(skill)
        return acc
    }, {} as Record<string, Skill[]>)

    return (
        <div className="container py-10">
            <div className="flex flex-col items-center gap-4 text-center mb-10">
                <h1 className="text-4xl font-bold font-heading">Technical Skills</h1>
                <p className="text-lg text-muted-foreground max-w-[600px]">
                    Technologies and tools I work with.
                </p>
            </div>

            <div className="space-y-10 max-w-4xl mx-auto">
                {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <div key={category} className="space-y-4">
                        <h3 className="text-2xl font-semibold capitalize border-b pb-2">{category}</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {categorySkills.map(skill => (
                                <SkillCard key={skill.id} skill={skill} />
                            ))}
                        </div>
                    </div>
                ))}

                {skills.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No skills listed yet.
                    </div>
                )}
            </div>
        </div>
    )
}
