"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader, AdminSearch, AdminFilter, AdminSummary, AdminEmpty } from "@/components/admin/AdminPage"
import { FileText, BookOpen, CircleCheck, FileClock } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star } from "lucide-react"

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
import type { BlogPost } from "@/types"

const blogSchema = z.object({
    title: z.string().min(2, "Title is required"),
    slug: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().min(10, "Content is required"),
    coverImage: z.string().optional(),
    images: z.array(z.string()).optional(),
    tags: z.string().optional(),
    published: z.boolean(),
    featured: z.boolean(),
})

type BlogFormValues = z.infer<typeof blogSchema>

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([])
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            coverImage: "",
            images: [],
            tags: "",
            published: false,
            featured: false,
        },
    })

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        try {
            const res = await axios.get("/api/blog?limit=100&includeUnpublished=true")
            setPosts(res.data.posts)
        } catch (error) {
            toast.error("Failed to fetch blog posts")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: BlogFormValues) => {
        try {
            const payload = {
                ...values,
                tags: values.tags ? values.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
            }

            if (editingPost) {
                await axios.put(`/api/blog/${editingPost.slug}`, payload)
                toast.success("Blog post updated successfully")
            } else {
                await axios.post("/api/blog", payload)
                toast.success("Blog post created successfully")
            }

            setIsOpen(false)
            fetchPosts()
            form.reset()
            setEditingPost(null)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save blog post")
        }
    }

    const handleEdit = (post: BlogPost) => {
        setEditingPost(post)
        form.reset({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || "",
            content: post.content,
            coverImage: post.coverImage || "",
            images: post.images || [],
            tags: post.tags.join(", "),
            published: post.published,
            featured: post.featured,
        })
        setIsOpen(true)
    }

    const handleDelete = async (post: BlogPost) => {
        if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return

        try {
            // Use encodeURIComponent for Thai slugs
            const identifier = post.slug ? encodeURIComponent(post.slug) : `unknown?id=${post.id}`;
            await axios.delete(`/api/blog/${identifier}`)
            toast.success("Blog post deleted successfully")
            fetchPosts()
        } catch (error: any) {
            console.error("Delete error:", error)
            // If 405 or 404, maybe the slug is broken, try to delete by ID if API supports it
            toast.error(error.response?.data?.message || "Failed to delete blog post. The URL might be invalid.")
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEditingPost(null)
            form.reset()
        }
    }

    const visiblePosts = posts.filter(post => ([post.title, post.excerpt, ...post.tags].join(" ")).toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || (filter === "published" ? post.published : !post.published)))

    return (
        <div className="space-y-6">
            <AdminPageHeader eyebrow="blog" title="บทความ" description="เขียนเรื่องราวใหม่ จัดการฉบับร่าง และติดตามบทความที่เผยแพร่"><Button onClick={() => setIsOpen(true)} className="rounded-xl"><Plus className="h-4 w-4" />เขียนบทความ</Button></AdminPageHeader>
            <AdminSummary items={[{ label: "บทความทั้งหมด", value: posts.length, icon: FileText }, { label: "เผยแพร่แล้ว", value: posts.filter(p => p.published).length, icon: CircleCheck }, { label: "ฉบับร่าง", value: posts.filter(p => !p.published).length, icon: FileClock }]} />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="admin-dialog sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingPost ? "แก้ไขบทความ" : "เขียนบทความใหม่"}</DialogTitle>
                        <DialogDescription>
                            {editingPost ? "Make changes to your blog post here." : "Create a new blog post."}
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
                                            <Input placeholder="Post title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug (optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="auto-generated-from-title" {...field} />
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Leave empty to auto-generate from title</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="excerpt"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Excerpt</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-20" placeholder="Brief summary of the post..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="content"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>เนื้อหา (Markdown)</FormLabel>
                                        <FormControl>
                                            <Textarea className="h-64 font-mono text-sm" placeholder="Write your blog post content..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="coverImage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Cover Image (Optional - will use first image from gallery if not set)</FormLabel>
                                        <FormControl>
                                            <ImageUpload preview="original"                                                 value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="images"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image Gallery</FormLabel>
                                        <FormControl>
                                            <MultiImageUpload
                                                value={field.value || []}
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
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (Comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="react, typescript, tutorial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="published"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>Published</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Make this post visible to the public.
                                                </p>
                                            </div>
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
                                                <FormLabel>Featured</FormLabel>
                                                <p className="text-sm text-muted-foreground">
                                                    Highlight this post on the blog page.
                                                </p>
                                            </div>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}บันทึกบทความ</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className="admin-toolbar"><AdminSearch value={query} onChange={setQuery} placeholder="ค้นหาบทความ…" /><AdminFilter value={filter} onChange={setFilter} options={[{value:"all", label:"ทั้งหมด",count:posts.length},{value:"published",label:"เผยแพร่แล้ว",count:posts.filter(p => p.published).length},{value:"draft",label:"ฉบับร่าง",count:posts.filter(p => !p.published).length}]} /></div>
            <p className="text-xs text-muted-foreground">แสดง {visiblePosts.length} จาก {posts.length} รายการ</p>
            <div className="admin-collection">
                <Table className="admin-data-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อ</TableHead>
                            <TableHead className="hidden md:table-cell">แท็ก</TableHead>
                            <TableHead className="hidden sm:table-cell">สถานะ</TableHead>
                            <TableHead>ยอดเข้าชม</TableHead>
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
                        ) : visiblePosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center"><AdminEmpty icon={FileText} title={query || filter !== "all" ? "ไม่พบรายการที่ตรงกัน" : "ยังไม่มีบทความ"} description={query || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เริ่มเพิ่มบทความด้วยปุ่มด้านบน"} /></TableCell>
                            </TableRow>
                        ) : (
                            visiblePosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell data-label="Title" className="font-medium">
                                        <div className="flex min-w-0 items-center gap-3">
                                            {post.coverImage && <img src={post.coverImage} alt="" loading="lazy" className="h-12 w-20 shrink-0 rounded-lg border object-cover" />}
                                            {post.featured && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                            {post.title}
                                        </div>
                                    </TableCell>
                                    <TableCell data-label="Tags" className="hidden md:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags.slice(0, 3).map(t => (
                                                <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell data-label="Status" className="hidden sm:table-cell">
                                        {post.published ? (
                                            <Badge variant="default" className="gap-1">
                                                <Eye className="h-3 w-3" /> Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1">
                                                <EyeOff className="h-3 w-3" /> Draft
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell data-label="Views">{post.viewCount}</TableCell>
                                    <TableCell data-label="Actions" className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button aria-label={"แก้ไข " + post.title} variant="ghost" size="icon" onClick={() => handleEdit(post)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button aria-label={"ลบ " + post.title} variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post)}>
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
