"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader, AdminSearch, AdminFilter, AdminSummary, AdminEmpty } from "@/components/admin/AdminPage"
import { Wrench, Tags, CircleCheck, FileClock } from "lucide-react"
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
    DialogDescription,
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
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState("all")
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

    const visibleSkills = skills.filter(skill => ([skill.name, skill.category].join(" ")).toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || (skill.category || "") === filter))

    return (
        <div className="space-y-6">
            <AdminPageHeader eyebrow="skills" title="ทักษะ" description="จัดหมวดหมู่ความเชี่ยวชาญและระดับทักษะที่แสดงบนเว็บไซต์"><Button onClick={() => setIsOpen(true)} className="rounded-xl"><Plus className="h-4 w-4" />เพิ่มทักษะ</Button></AdminPageHeader>
            <AdminSummary items={[{ label: "ทักษะทั้งหมด", value: skills.length, icon: Wrench }, { label: "หมวดหมู่", value: new Set(skills.map(s => s.category)).size, icon: Tags }, { label: "ความชำนาญเฉลี่ย", value: skills.length ? Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length) + "%" : "—", icon: Wrench }]} />

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogContent className="admin-dialog">
                    <DialogHeader>
                        <DialogTitle>{editingSkill ? "แก้ไขทักษะ" : "เพิ่มทักษะใหม่"}</DialogTitle><DialogDescription>ระบุหมวดหมู่และความชำนาญที่ต้องการแสดงบนเว็บไซต์</DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ชื่อทักษะ</FormLabel>
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
                                        <FormLabel>หมวดหมู่</FormLabel>
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
                                        <FormLabel>ความชำนาญ (0–100%)</FormLabel>
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
                                        <FormLabel>ไอคอนทักษะ</FormLabel>
                                        <FormControl>
                                            <ImageUpload preview="original"                                                 value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={form.formState.isSubmitting}>ยกเลิก</Button><Button type="submit" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}บันทึกทักษะ</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <div className="admin-toolbar"><AdminSearch value={query} onChange={setQuery} placeholder="ค้นหาทักษะ…" /><select aria-label="กรองหมวดหมู่ทักษะ" value={filter} onChange={event => setFilter(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm sm:w-auto"><option value="all">ทุกหมวดหมู่</option>{Array.from(new Set(skills.map(skill=>skill.category || ""))).map(category=><option key={category} value={category}>{category || "ไม่มีหมวด"}</option>)}</select></div>
            <p className="text-xs text-muted-foreground">แสดง {visibleSkills.length} จาก {skills.length} รายการ</p>
            <div className="admin-collection">
                <Table className="admin-data-table">
                    <TableHeader>
                        <TableRow>
                            <TableHead>ชื่อทักษะ</TableHead>
                            <TableHead>หมวดหมู่</TableHead>
                            <TableHead>ความชำนาญ</TableHead>
                            <TableHead className="text-right">จัดการ</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : visibleSkills.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center"><AdminEmpty icon={Wrench} title={query || filter !== "all" ? "ไม่พบรายการที่ตรงกัน" : "ยังไม่มีทักษะ"} description={query || filter !== "all" ? "ลองเปลี่ยนคำค้นหาหรือตัวกรอง" : "เริ่มเพิ่มทักษะด้วยปุ่มด้านบน"} /></TableCell>
                            </TableRow>
                        ) : (
                            visibleSkills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell data-label="Name" className="font-medium flex items-center gap-2">
                                        {skill.icon && <img src={skill.icon} className="h-8 w-8 shrink-0 rounded-lg bg-white p-1" alt="" />}
                                        {skill.name}
                                    </TableCell>
                                    <TableCell data-label="Category"><Badge variant="outline">{skill.category}</Badge></TableCell>
                                    <TableCell data-label="Proficiency">
                                        <div className="w-full min-w-0 flex-1"><span className="mb-2 block text-xs">{skill.proficiency}%</span><div className="w-full max-w-[100px] bg-secondary rounded-full h-1.5">
                                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                                        </div>
                                    </div></TableCell>
                                    <TableCell data-label="Actions" className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button aria-label={"แก้ไข " + skill.name} variant="ghost" size="icon" onClick={() => handleEdit(skill)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button aria-label={"ลบ " + skill.name} variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(skill.id)}>
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
