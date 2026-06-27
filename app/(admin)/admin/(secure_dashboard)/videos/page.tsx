"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Search, Loader2, Video as VideoIcon, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { Video, VideoCategory } from "@/types"

const videoSchema = z.object({
    title: z.string().min(2, "Title is required"),
    description: z.string().optional(),
    youtubeUrl: z.string().url("Must be a valid URL").refine(
        (url) => url.includes("youtube.com") || url.includes("youtu.be"),
        "Must be a YouTube URL"
    ),
    thumbnailUrl: z.string().optional(),
    categoryId: z.string().optional(),
    tags: z.string().optional(),
    duration: z.string().optional(),
    published: z.boolean(),
    featured: z.boolean(),
})

type VideoFormValues = z.infer<typeof videoSchema>

export default function AdminVideosPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [categories, setCategories] = useState<VideoCategory[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [isCategoryOpen, setIsCategoryOpen] = useState(false)
    const [editingVideo, setEditingVideo] = useState<Video | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [newCategoryName, setNewCategoryName] = useState("")
    const [fetchingMeta, setFetchingMeta] = useState(false)

    const form = useForm<VideoFormValues>({
        resolver: zodResolver(videoSchema),
        defaultValues: {
            title: "",
            description: "",
            youtubeUrl: "",
            thumbnailUrl: "",
            categoryId: "",
            tags: "",
            duration: "",
            published: false,
            featured: false,
        },
    })

    useEffect(() => {
        fetchVideos()
        fetchCategories()
    }, [])

    async function fetchYouTubeMetadata(url: string) {
        if (!url.includes("youtube.com") && !url.includes("youtu.be")) return
        try {
            setFetchingMeta(true)
            const res = await axios.get(`/api/videos/metadata?url=${encodeURIComponent(url)}`)
            const meta = res.data
            if (meta.title && !form.getValues("title")) {
                form.setValue("title", meta.title)
            }
            if (meta.description && !form.getValues("description")) {
                form.setValue("description", meta.description)
            }
            if (meta.thumbnailUrl) {
                form.setValue("thumbnailUrl", meta.thumbnailUrl)
            }
            if (meta.duration) {
                form.setValue("duration", meta.duration)
            }
            if (meta.tags?.length && !form.getValues("tags")) {
                form.setValue("tags", meta.tags.join(", "))
            }
            toast.success("Fetched video info from YouTube")
        } catch (error) {
            // Silent fail - user can still fill manually
        } finally {
            setFetchingMeta(false)
        }
    }

    async function fetchVideos() {
        try {
            setIsLoading(true)
            const res = await axios.get("/api/videos?limit=100")
            setVideos(res.data.videos || [])
        } catch (error) {
            toast.error("Failed to load videos")
        } finally {
            setIsLoading(false)
        }
    }

    async function fetchCategories() {
        try {
            const res = await axios.get("/api/videos/categories")
            setCategories(res.data || [])
        } catch (error) {
            console.error("Failed to load categories")
        }
    }

    async function onSubmit(data: VideoFormValues) {
        try {
            const payload = {
                ...data,
                tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                categoryId: data.categoryId || null,
                thumbnailUrl: data.thumbnailUrl || null,
                duration: data.duration || null,
            }

            if (editingVideo) {
                await axios.put(`/api/videos/${editingVideo.id}`, payload)
                toast.success("Video updated successfully")
            } else {
                await axios.post("/api/videos", payload)
                toast.success("Video created successfully")
            }

            setIsOpen(false)
            setEditingVideo(null)
            form.reset()
            fetchVideos()
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save video")
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this video?")) return

        try {
            await axios.delete(`/api/videos/${id}`)
            toast.success("Video deleted")
            fetchVideos()
        } catch (error) {
            toast.error("Failed to delete video")
        }
    }

    async function handleCreateCategory() {
        if (!newCategoryName.trim()) return
        try {
            await axios.post("/api/videos/categories", { name: newCategoryName.trim() })
            toast.success("Category created")
            setNewCategoryName("")
            setIsCategoryOpen(false)
            fetchCategories()
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to create category")
        }
    }

    function openEdit(video: Video) {
        setEditingVideo(video)
        form.reset({
            title: video.title,
            description: video.description || "",
            youtubeUrl: video.youtubeUrl,
            thumbnailUrl: video.thumbnailUrl || "",
            categoryId: video.categoryId || "",
            tags: video.tags.join(", "),
            duration: video.duration || "",
            published: video.published,
            featured: video.featured,
        })
        setIsOpen(true)
    }

    function openCreate() {
        setEditingVideo(null)
        form.reset({
            title: "",
            description: "",
            youtubeUrl: "",
            thumbnailUrl: "",
            categoryId: "",
            tags: "",
            duration: "",
            published: false,
            featured: false,
        })
        setIsOpen(true)
    }

    const filteredVideos = searchQuery
        ? videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : videos

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Videos</h1>
                    <p className="text-muted-foreground">Manage your YouTube videos</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsCategoryOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Category
                    </Button>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Video
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {/* Video Table */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Video</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Views</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredVideos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No videos found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredVideos.map((video) => (
                                    <TableRow key={video.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {video.thumbnailUrl && (
                                                    <img
                                                        src={video.thumbnailUrl}
                                                        alt=""
                                                        className="w-20 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium line-clamp-1">{video.title}</p>
                                                    {video.duration && (
                                                        <p className="text-xs text-muted-foreground">{video.duration}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {video.category ? (
                                                <Badge variant="secondary">{video.category.name}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={video.published ? "default" : "outline"}>
                                                {video.published ? "Published" : "Draft"}
                                            </Badge>
                                            {video.featured && (
                                                <Badge variant="secondary" className="ml-1">Featured</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{video.viewCount}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(video.youtubeUrl, '_blank')}
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => openEdit(video)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(video.id)}
                                                    className="text-destructive hover:text-destructive"
                                                >
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
            )}

            {/* Video Form Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingVideo ? "Edit Video" : "Add New Video"}</DialogTitle>
                        <DialogDescription>
                            {editingVideo ? "Update video details" : "Add a YouTube video to your portfolio"}
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
                                            <Input placeholder="Video title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="youtubeUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>YouTube URL</FormLabel>
                                        <FormControl>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="https://www.youtube.com/watch?v=..."
                                                    {...field}
                                                    onBlur={(e) => {
                                                        field.onBlur()
                                                        if (e.target.value) fetchYouTubeMetadata(e.target.value)
                                                    }}
                                                />
                                                {fetchingMeta && <Loader2 className="h-5 w-5 animate-spin mt-2" />}
                                            </div>
                                        </FormControl>
                                        <p className="text-xs text-muted-foreground">Paste URL แล้ว title, thumbnail, duration จะถูกดึงจาก YouTube อัตโนมัติ</p>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Video description (optional)" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="categoryId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {categories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="duration"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Duration (auto-fetched)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Auto from YouTube" {...field} readOnly />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="tags"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tags (comma separated)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="react, nextjs, tutorial" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Thumbnail URL (auto-fetched from YouTube)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Auto-generated from YouTube" {...field} readOnly />
                                        </FormControl>
                                        {field.value && (
                                            <img src={field.value} alt="Thumbnail preview" className="w-48 rounded mt-2" />
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-6">
                                <FormField
                                    control={form.control}
                                    name="published"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Published</FormLabel>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="featured"
                                    render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                            <FormLabel className="!mt-0">Featured</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editingVideo ? "Update" : "Create"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Category Dialog */}
            <Dialog open={isCategoryOpen} onOpenChange={setIsCategoryOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Video Category</DialogTitle>
                        <DialogDescription>Create a new category for organizing videos</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            placeholder="Category name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateCategory()}
                        />
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <Badge key={cat.id} variant="secondary">{cat.name}</Badge>
                                ))}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCategoryOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCategory}>Create</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
