import type { Project } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface ProjectCardProps {
    project: Project
    priority?: boolean
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
    return (
        <Card className="flex flex-col overflow-hidden h-full transition-all hover:shadow-lg dark:hover:shadow-primary/10 theme-card hextech-border">
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {project.imageUrl ? (
                    <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                    {project.category && (
                        <Badge variant="secondary" className="text-xs">{project.category.name}</Badge>
                    )}
                </div>
                <CardDescription className="line-clamp-2">{project.shortDescription || project.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                    {project.technologies.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                    ))}
                    {project.technologies.length > 3 && (
                        <Badge variant="outline" className="text-xs">+{project.technologies.length - 3}</Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter>
                <Link href={`/projects/${project.id}`} className="w-full">
                    <Button className="w-full">View Details</Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
