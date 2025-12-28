import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Skill } from "@/types"

interface SkillCardProps {
    skill: Skill
}

export function SkillCard({ skill }: SkillCardProps) {
    return (
        <Card className="flex items-center justify-between p-4 transition-all hover:bg-muted/50 theme-card">
            <div className="flex items-center gap-3">
                {skill.icon && <img src={skill.icon} alt={skill.name} className="h-8 w-8" />}
                <span className="font-semibold">{skill.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="hidden h-2 w-24 rounded-full bg-secondary md:block overflow-hidden">
                    <div
                        className="h-full bg-primary"
                        style={{ width: `${skill.proficiency}%` }}
                    />
                </div>
                <Badge variant="outline">{skill.proficiency}%</Badge>
            </div>
        </Card>
    )
}
