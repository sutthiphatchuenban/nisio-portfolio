"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
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
import { Badge } from "@/components/ui/badge"
import type { Skill } from "@/types"

const skillSchema = z.object({
    name: z.string().min(1, "Name is required"),
    category: z.string().min(1, "Category is required"),
    proficiency: z.number().min(0).max(100),
    icon: z.string().optional(),
})

interface SkillFormValues {
    name: string
    category: string
    proficiency: number
    icon?: string
}

export default function AdminSkillsPage() {
    const [skills, setSkills] = useState<Skill[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [editingSkill, setEditingSkill] = useState<Skill | null>(null)

    const form = useForm<SkillFormValues>({
        resolver: zodResolver(skillSchema) as any,
        defaultValues: {
            name: "",
            category: "Frontend",
            proficiency: 50,
            icon: "",
        },
    })

    useEffect(() => {
        fetchSkills()
    }, [])

    const fetchSkills = async () => {
        try {
            const res = await axios.get("/api/skills")
            setSkills(res.data.skills)
        } catch (error) {
            toast.error("Failed to fetch skills")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: SkillFormValues) => {
        try {
            if (editingSkill) {
                await axios.put(`/api/skills/${editingSkill.id}`, values)
                toast.success("Skill updated successfully")
            } else {
                await axios.post("/api/skills", values)
                toast.success("Skill created successfully")
            }
            setIsOpen(false)
            fetchSkills()
            form.reset()
            setEditingSkill(null)
        } catch (error) {
            toast.error("Failed to save skill")
        }
    }

    const handleEdit = (skill: Skill) => {
        setEditingSkill(skill)
        form.reset({
            name: skill.name,
            category: skill.category || "Other",
            proficiency: skill.proficiency,
            icon: skill.icon || "",
        })
        setIsOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure?")) return
        try {
            await axios.delete(`/api/skills/${id}`)
            toast.success("Skill deleted")
            fetchSkills()
        } catch (error) {
            toast.error("Failed to delete skill")
        }
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setEditingSkill(null)
            form.reset()
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
                <Button onClick={() => setIsOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Skill
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSkill ? "Edit Skill" : "New Skill"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="React" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Frontend, Backend, Tools..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="proficiency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Proficiency (0-100)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="icon"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Skill Icon</FormLabel>
                                        <FormControl>
                                            <ImageUpload
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit">Save</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className="rounded-md border bg-card p-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Proficiency</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : skills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">No skills found.</TableCell>
                            </TableRow>
                        ) : (
                            skills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        {skill.icon && <img src={skill.icon} className="w-5 h-5" alt="" />}
                                        {skill.name}
                                    </TableCell>
                                    <TableCell><Badge variant="outline">{skill.category}</Badge></TableCell>
                                    <TableCell>
                                        <div className="w-full max-w-[100px] bg-secondary rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(skill)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(skill.id)}>
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
