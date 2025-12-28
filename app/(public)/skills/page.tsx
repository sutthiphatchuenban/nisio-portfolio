import Prisma from "@/lib/prisma"
import { SkillCard } from "@/components/skills/SkillCard"
import type { Skill } from "@/types"

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
