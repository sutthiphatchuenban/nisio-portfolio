"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import { MultiImageUpload } from "@/components/ui/multi-image-upload"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { Project } from "@/types"

const projectSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().min(10, "Description is required"),
    shortDescription: z.string().optional(),
    imageUrl: z.string().optional(),
    images: z.array(z.string()),
    projectUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    technologies: z.string().min(1, "Technologies are required (comma separated)"),
    featured: z.boolean(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<Project | null>(null)

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            shortDescription: "",
            imageUrl: "",
            images: [],
            projectUrl: "",
            githubUrl: "",
            technologies: "",
            featured: false,
        },
    })

    useEffect(() => {
        fetchProjects()
    }, [])

    const fetchProjects = async () => {
        try {
            const res = await axios.get("/api/projects?limit=100")
            setProjects(res.data.projects)
        } catch (error) {
            toast.error("Failed to fetch projects")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: ProjectFormValues) => {
        try {
            const payload = {
                ...values,
                technologies: values.technologies.split(",").map((t) => t.trim()),
            }

            if (editingProject) {
                await axios.put(`/api/projects/${editingProject.id}`, payload)
                toast.success("Project updated successfully")
            } else {
                await axios.post("/api/projects", payload)
                toast.success("Project created successfully")
            }

            setIsOpen(false)
            fetchProjects()
            form.reset()
            setEditingProject(null)
        } catch (error) {
            toast.error("Failed to save project")
        }
    }

    const handleEdit = (project: Project) => {
        setEditingProject(project)
        form.reset({
            title: project.title,
            description: project.description,
            shortDescription: project.shortDescription || "",
            imageUrl: project.imageUrl || "",
            images: project.images || [],
            projectUrl: project.projectUrl || "",
            githubUrl: project.githubUrl || "",
            technologies: project.technologies.join(", "),
            featured: project.featured,
        })
        setIsOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return

        try {
            await axios.delete(`/api/projects/${id}`)
            toast.success("Project deleted successfully")
            fetchProjects()
        } catch (error) {
            toast.error("Failed to delete project")
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEditingProject(null)
            form.reset()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Project
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? "Edit Project" : "New Project"}</DialogTitle>
                        <DialogDescription>
                            {editingProject ? "Make changes to your project here." : "Add a new project to your portfolio."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Project Name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="shortDescription"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Description</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Brief summary for cards" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Description (Markdown supported)</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-32" placeholder="Detailed description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="projectUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Live URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="githubUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>GitHub URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://github.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="imageUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail Image</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Main preview image shown in project cards</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project Gallery</FormLabel>
                                        <FormControl>
                                            <MultiImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                                maxImages={10}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="technologies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Technologies (Comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="React, Next.js, TypeScript" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="featured"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Featured Project</FormLabel>
                                            <p className="text-sm text-muted-foreground">
                                                Show this project on the home page.
                                            </p>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Save changes</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-white dark:bg-black p-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden md:table-cell">Tech Stack</TableHead>
                            <TableHead className="hidden sm:table-cell">Status</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : projects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No projects found.</TableCell>
                            </TableRow>
                        ) : (
                            projects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">{project.title}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {project.technologies.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell capitalize">{project.status}</TableCell>
                                    <TableCell>
                                        {project.featured ? <Badge variant="default">Yes</Badge> : <span className="text-muted-foreground text-sm">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
