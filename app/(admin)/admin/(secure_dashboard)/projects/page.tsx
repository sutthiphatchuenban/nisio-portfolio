"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader, AdminSearch, AdminFilter, AdminSummary, AdminEmpty } from "@/components/admin/AdminPage"
import { FolderKanban, Layers, CircleCheck, FileClock } from "lucide-react"
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
    status: z.enum(["draft", "published", "archived"]),
})

type ProjectFormValues = z.infer<typeof projectSchema>

export default function AdminProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([])
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState("all")
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
            status: "draft",
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
            status: (project.status as "draft" | "published" | "archived") || "draft",
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

    const visibleProjects = projects.filter(project => ([project.title, project.shortDescription, ...project.technologies].join(" ")).toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || project.status === filter))

    return (
        <div className="space-y-6">
            <AdminPageHeader eyebrow="projects" title="โปรเจกต์" description="จัดการผลงาน รูปภาพ และสถานะการเผยแพร่ในพอร์ตโฟลิโอของคุณ"><Button onClick={() => setIsOpen(true)} className="rounded-xl"><Plus className="h-4 w-4" />เพิ่มโปรเจกต์</Button></AdminPageHeader>
            <AdminSummary items={[{ label: "โปรเจกต์ทั้งหมด", value: projects.length, icon: FolderKanban }, { label: "เผยแพร่แล้ว", value: projects.filter(p => p.status === "published").length, icon: CircleCheck }, { label: "ฉบับร่าง", value: projects.filter(p => p.status === "draft").length, icon: FileClock }]} />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="admin-dialog sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? "แก้ไขโปรเจกต์" : "เพิ่มโปรเจกต์ใหม่"}</DialogTitle>
                        <DialogDescription>
                            {editingProject ? "Make changes to your project here." : "กรอกรายละเอียดและรูปภาพของผลงานที่ต้องการแสดงบนเว็บไซต์"}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อ</FormLabel>
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
                                        <FormLabel>คำอธิบายสั้น</FormLabel>
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
                                        <FormLabel>รายละเอียด (Markdown)</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-32" placeholder="Detailed description..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                                        <FormLabel>ภาพหน้าปก</FormLabel>
                                        <FormControl>
                                            <ImageUpload preview="original"                                                 value={field.value}
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
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                {...field}
                                            >
                                                <option value="draft">Draft</option>
                                                <option value="published">Published</option>
                                                <option value="archived">Archived</option>
                                            </select>
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
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}บันทึกการเปลี่ยนแปลง</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className="admin-toolbar"><AdminSearch value={query} onChange={setQuery} placeholder="ค้นหาโปรเจกต์…" /><AdminFilter value={filter} onChange={setFilter} options={[{value:"all", label:"ทั้งหมด",count:projects.length},{value:"published",label:"เผยแพร่แล้ว",count:projects.filter(p => p.status === "published").length},{value:"draft",label:"ฉบับร่าง",count:projects.filter(p => p.status === "draft").length}, {value:"archived",label:"เก็บถาวร"}]} /></div>
            <p className="text-xs text-muted-foreground">แสดง {visibleProjects.length} จาก {projects.length} รายการ</p>
            <div className="admin-collection">
                <Table className="admin-data-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead className="hidden md:table-cell">เทคโนโลยี</TableHead>
                            <TableHead className="hidden sm:table-cell">สถานะ</TableHead>
                            <TableHead>แนะนำ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : visibleProjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center"><AdminEmpty icon={FolderKanban} title={query || filter !== "all" ? "ไม่พบรายการที่ตรงกัน" : "ยังไม่มีโปรเจกต์"} description={query || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เริ่มเพิ่มโปรเจกต์ด้วยปุ่มด้านบน"} /></TableCell>
                            </TableRow>
                        ) : (
                            visibleProjects.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell data-label="Title" className="font-medium"><div className="flex min-w-0 items-center gap-3">{project.imageUrl ? <img src={project.imageUrl} alt="" loading="lazy" className="h-12 w-20 shrink-0 rounded-lg border object-cover" /> : <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border bg-muted"><FolderKanban className="h-5 w-5 text-muted-foreground" /></div>}<div className="min-w-0"><p className="line-clamp-2 font-medium">{project.title}</p>{project.shortDescription && <p className="mt-1 line-clamp-1 text-xs font-normal text-muted-foreground">{project.shortDescription}</p>}</div></div></TableCell>
                                    <TableCell data-label="Tech Stack" className="hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {project.technologies.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell data-label="Status" className="hidden sm:table-cell"><Badge variant="outline" className="gap-1.5"><span className={"h-1.5 w-1.5 rounded-full " + (project.status === "published" ? "bg-emerald-500" : project.status === "draft" ? "bg-amber-500" : "bg-muted-foreground")} />{project.status === "published" ? "เผยแพร่แล้ว" : project.status === "draft" ? "ฉบับร่าง" : "เก็บถาวร"}</Badge></TableCell>
                                    <TableCell data-label="Featured">
                                        {project.featured ? <Badge variant="secondary">แนะนำ</Badge> : <span className="text-muted-foreground text-sm">-</span>}
                                    </TableCell>
                                    <TableCell data-label="Actions" className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button aria-label={"แก้ไข " + project.title} variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button aria-label={"ลบ " + project.title} variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(project.id)}>
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
