"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import axios from "axios"
import { toast } from "sonner"
import { ArrowUpRight, Check, Globe2, ImageIcon, Link2, Loader2, Palette, RotateCcw, Save, UserRound } from "lucide-react"
import Link from "next/link"
import { HeroPreview } from "@/components/admin/HeroPreview"
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Switch } from "@/components/ui/switch"
import { FESTIVAL_THEMES, getFestivalForDate } from "@/lib/theme-catalog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"

interface SettingsFormValues {
    autoSeasonalTheme: boolean
    siteName: string
    siteDescription: string
    name: string
    title: string
    bio: string
    avatar: string
    heroImage: string
    heroImageMobile: string
    email: string
    location: string
    resumeUrl: string
    githubUrl: string
    linkedinUrl: string
    twitterUrl: string
}

const sections = [
    { id: "general", label: "เว็บไซต์", detail: "ชื่อเว็บและการค้นหา", icon: Globe2 },
    { id: "images", label: "ภาพหน้าแรก", detail: "Desktop และ Mobile", icon: ImageIcon },
    { id: "profile", label: "โปรไฟล์", detail: "ข้อมูลและประวัติ", icon: UserRound },
    { id: "social", label: "ช่องทางติดต่อ", detail: "โซเชียลและเรซูเม่", icon: Link2 },
    { id: "appearance", label: "ธีมและเทศกาล", detail: "บรรยากาศตลอดปี", icon: Palette },
] as const

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
    return <section className="min-w-0 rounded-2xl border bg-card shadow-sm"><div className="border-b px-5 py-5 sm:px-6"><h2 className="text-lg font-semibold tracking-tight">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div><div className="space-y-6 p-5 sm:p-6">{children}</div></section>
}

export default function AdminSettingsPage() {
    const [active, setActive] = useState<typeof sections[number]["id"]>("general")
    const [loadError, setLoadError] = useState(false)
    const [uploads, setUploads] = useState<Record<string, boolean>>({})
    const [bioPreview, setBioPreview] = useState(false)
    const [currentFestival, setCurrentFestival] = useState<string>()
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const { refetch } = useSiteSettings()

    const form = useForm<SettingsFormValues>({
        defaultValues: {
            autoSeasonalTheme: false,
            siteName: "",
            siteDescription: "",
            name: "",
            title: "",
            bio: "",
            avatar: "",
            heroImage: "",
            heroImageMobile: "",
            email: "",
            location: "",
            resumeUrl: "",
            githubUrl: "",
            linkedinUrl: "",
            twitterUrl: "",
        },
    })

    useEffect(() => {
        fetchSettings()
        setCurrentFestival(getFestivalForDate().id)
    }, [])

    const fetchSettings = async () => {
        setIsLoading(true)
        setLoadError(false)
        try {
            const res = await axios.get("/api/settings")
            form.reset({
                autoSeasonalTheme: res.data.autoSeasonalTheme === true,
                siteName: res.data.siteName || "",
                siteDescription: res.data.siteDescription || "",
                name: res.data.name || "",
                title: res.data.title || "",
                bio: res.data.bio || "",
                avatar: res.data.avatar || "",
                heroImage: res.data.heroImage || "",
                heroImageMobile: res.data.heroImageMobile || "",
                email: res.data.email || "",
                location: res.data.location || "",
                resumeUrl: res.data.resumeUrl || "",
                githubUrl: res.data.githubUrl || "",
                linkedinUrl: res.data.linkedinUrl || "",
                twitterUrl: res.data.twitterUrl || "",
            })
        } catch (error) {
            setLoadError(true)
            toast.error("โหลดการตั้งค่าไม่สำเร็จ กรุณาลองใหม่")
        } finally {
            setIsLoading(false)
        }
    }

    const onSubmit = async (values: SettingsFormValues) => {
        if (isSaving || Object.values(uploads).some(Boolean) || loadError) return
        setIsSaving(true)
        try {
            await axios.put("/api/settings", values)
            form.reset(values)
            toast.success("บันทึกการตั้งค่าแล้ว")
            await refetch()
        } catch (error) {
            toast.error("บันทึกไม่สำเร็จ ข้อมูลที่แก้ไขยังอยู่ กรุณาลองใหม่")
        } finally {
            setIsSaving(false)
        }
    }


    const values = form.watch()
    const { isDirty } = form.formState
    const uploading = Object.values(uploads).some(Boolean)
    const busy = isSaving || uploading

    useEffect(() => {
        if (!isDirty && !uploading) return
        const preventLeave = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = "" }
        window.addEventListener("beforeunload", preventLeave)
        return () => window.removeEventListener("beforeunload", preventLeave)
    }, [isDirty, uploading])

    const textField = (name: Exclude<keyof SettingsFormValues, "autoSeasonalTheme">, label: string, placeholder: string, description?: string, type = "text") => (
        <FormField key={name} control={form.control} name={name} render={({ field }) => <FormItem className="min-w-0"><FormLabel>{label}</FormLabel><FormControl><Input {...field} type={type} placeholder={placeholder} disabled={isSaving} className="h-11 min-w-0 bg-background text-base sm:text-sm" /></FormControl>{description && <FormDescription>{description}</FormDescription>}<FormMessage /></FormItem>} />
    )
    const imageField = (name: "heroImage" | "heroImageMobile" | "avatar", label: string, preview: "original" | "avatar", description: string) => (
        <FormField control={form.control} name={name} render={({ field }) => <FormItem className="min-w-0"><FormLabel>{label}</FormLabel><ImageUpload value={field.value} onChange={field.onChange} disabled={isSaving} preview={preview} label={label} onUploadingChange={value => setUploads(previous => ({ ...previous, [name]: value }))} /><FormDescription>{description}</FormDescription><FormMessage /></FormItem>} />
    )

    if (isLoading) return <div className="flex min-h-96 items-center justify-center gap-3 text-muted-foreground" role="status"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลดการตั้งค่า…</div>
    if (loadError) return <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 text-center"><h1 className="text-xl font-semibold">โหลดการตั้งค่าไม่ได้</h1><p className="my-4 text-sm text-muted-foreground">ลองเชื่อมต่ออีกครั้งก่อนแก้ไขข้อมูล</p><Button onClick={fetchSettings}>ลองอีกครั้ง</Button></div>

    return (
        <div className="mx-auto max-w-[1440px] pb-4">
            <div className="flex flex-wrap items-start justify-between gap-4 pb-7 pt-2">
                <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace / Settings</p><h1 className="text-3xl font-semibold tracking-tight">ตั้งค่าเว็บไซต์</h1><p className="mt-2 text-sm text-muted-foreground">ปรับรายละเอียด ภาพลักษณ์ และบรรยากาศของเว็บไซต์คุณ</p></div>
                <Button variant="outline" asChild className="rounded-full"><Link href="/" target="_blank" rel="noopener noreferrer">ดูเว็บไซต์<ArrowUpRight className="h-4 w-4" /></Link></Button>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid min-w-0 gap-5 xl:grid-cols-[210px_minmax(0,1fr)] xl:gap-8">
                        <aside className="min-w-0">
                            <div className="xl:hidden">
                                <label htmlFor="settings-section" className="mb-2 block text-xs font-medium text-muted-foreground">หมวดการตั้งค่า</label>
                                <select id="settings-section" value={active} onChange={event => setActive(event.target.value as typeof active)} className="h-12 w-full rounded-xl border bg-card px-4 text-base font-medium text-foreground">
                                    {sections.map(section => <option key={section.id} value={section.id}>{section.label} — {section.detail}</option>)}
                                </select>
                            </div>
                            <nav aria-label="หมวดการตั้งค่า" className="hidden gap-1 rounded-xl border bg-card p-1.5 xl:sticky xl:top-6 xl:flex xl:flex-col">
                                {sections.map(section => <button key={section.id} type="button" aria-current={active === section.id ? "page" : undefined} onClick={() => setActive(section.id)} className={"flex shrink-0 items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors " + (active === section.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><section.icon className="h-4 w-4 shrink-0" /><span><span className="block whitespace-nowrap text-sm font-medium">{section.label}</span><span className="mt-0.5 hidden text-[11px] text-muted-foreground xl:block">{section.detail}</span></span></button>)}
                            </nav>
                        </aside>
                        <div className="min-w-0 space-y-5" aria-label={sections.find(section => section.id === active)?.label}>
                            {active === "general" && <>
                                <Panel title="ข้อมูลเว็บไซต์" description="ชื่อและคำอธิบายที่ผู้เข้าชมเห็น รวมถึงข้อมูลที่แสดงบนผลการค้นหา">
                                    {textField("siteName", "ชื่อเว็บไซต์", "ชื่อเว็บไซต์ของคุณ", "ใช้บน Navbar และชื่อแท็บเบราว์เซอร์")}
                                    <FormField control={form.control} name="siteDescription" render={({ field }) => <FormItem><FormLabel>คำอธิบายเว็บไซต์</FormLabel><FormControl><Textarea {...field} disabled={isSaving} className="min-h-28 resize-y bg-background text-base sm:text-sm" placeholder="อธิบายเว็บไซต์ของคุณในประโยคสั้น ๆ" /></FormControl><FormDescription>ใช้เป็น SEO meta description · {field.value.length} ตัวอักษร</FormDescription></FormItem>} />
                                </Panel>
                                <Panel title="ตัวอย่างข้อมูลบนผลการค้นหา" description="ตัวอย่างชื่อและคำอธิบายจากข้อมูลที่กำลังแก้ไข">
                                    <div className="rounded-xl border bg-background p-5"><p className="mb-2 text-xs text-muted-foreground">เว็บไซต์ของคุณ /</p><p className="break-words text-xl font-medium text-primary">{values.siteName || "ชื่อเว็บไซต์"} — {values.name || "ชื่อของคุณ"}</p><p className="mt-2 break-words text-sm leading-6 text-muted-foreground">{values.siteDescription || "คำอธิบายเว็บไซต์จะแสดงที่นี่"}</p></div>
                                    <p className="text-xs text-muted-foreground">รูปแบบจริงอาจแตกต่างตามหน้าที่เปิดและผู้ให้บริการค้นหา</p>
                                </Panel>
                            </>}
                            {active === "images" && <>
                                <Panel title="ภาพหน้าแรก" description="ดูภาพต้นฉบับเต็มรูปก่อน แล้วตรวจการครอปในตัวอย่างหน้าเว็บไซต์ด้านล่าง">
                                    <div className="grid min-w-0 gap-6 md:grid-cols-2">
                                        {imageField("heroImage", "ภาพ Desktop", "original", "ใช้เมื่อหน้าจอกว้างตั้งแต่ 768px · ครอปแบบ cover ตรงกลางภาพ")}
                                        {imageField("heroImageMobile", "ภาพ Mobile", "original", "ใช้เมื่อหน้าจอแคบกว่า 768px · พื้นที่ภาพด้านบนสูง 480px")}
                                    </div>
                                </Panel>
                                <Panel title="Live preview" description="อัปเดตตามรูป ชื่อ และตำแหน่งที่กำลังแก้ไข โดยไม่ต้องบันทึกก่อน"><HeroPreview values={{ heroImage: values.heroImage, heroImageMobile: values.heroImageMobile, name: values.name, title: values.title, siteName: values.siteName }} /></Panel>
                            </>}
                            {active === "profile" && <>
                                <Panel title="โปรไฟล์สาธารณะ" description="ข้อมูลแนะนำตัวที่ใช้บนหน้า Home และ About">
                                    <div className="grid gap-7 md:grid-cols-[180px_minmax(0,1fr)]">
                                        {imageField("avatar", "รูปโปรไฟล์", "avatar", "แสดงเป็นวงกลมบนหน้า About · แนะนำรูปจัตุรัส")}
                                        <div className="grid min-w-0 gap-5">{textField("name", "ชื่อที่แสดง", "ชื่อ–นามสกุล")}{textField("title", "ตำแหน่ง / สิ่งที่คุณทำ", "เช่น Full Stack Developer")}{textField("location", "ที่อยู่ / ประเทศ", "Bangkok, Thailand")}{textField("email", "อีเมลสาธารณะ", "hello@example.com", "แสดงให้ผู้เข้าชมเห็นบนหน้า About", "email")}</div>
                                    </div>
                                </Panel>
                                <Panel title="เกี่ยวกับคุณ" description="ประวัติ ประสบการณ์ และสิ่งที่อยากเล่า รองรับ Markdown">
                                    <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit"><Button type="button" size="sm" variant={!bioPreview ? "secondary" : "ghost"} aria-pressed={!bioPreview} onClick={() => setBioPreview(false)}>เขียน</Button><Button type="button" size="sm" variant={bioPreview ? "secondary" : "ghost"} aria-pressed={bioPreview} onClick={() => setBioPreview(true)}>ดูตัวอย่าง</Button></div>
                                    {bioPreview ? <div className="min-h-72 overflow-x-auto rounded-xl border bg-background p-5">{values.bio ? <MarkdownRenderer content={values.bio} /> : <p className="text-sm text-muted-foreground">ยังไม่มีเนื้อหา</p>}</div> : <FormField control={form.control} name="bio" render={({ field }) => <FormItem><FormLabel className="sr-only">ประวัติ (Markdown)</FormLabel><FormControl><Textarea {...field} disabled={isSaving} placeholder="เล่าเรื่องราวของคุณ…" className="min-h-96 resize-y bg-background font-mono text-base leading-7 sm:text-sm" /></FormControl><FormDescription>ใช้ # สำหรับหัวข้อ, **ข้อความ** สำหรับตัวหนา และ - สำหรับรายการ</FormDescription></FormItem>} />}
                                </Panel>
                            </>}
                            {active === "social" && <Panel title="ช่องทางติดต่อและเรซูเม่" description="ใส่ URL เต็มของโปรไฟล์ เว้นว่างหากไม่ต้องการแสดงช่องทางนั้น">
                                {textField("githubUrl", "GitHub", "https://github.com/username", undefined, "url")}
                                {textField("linkedinUrl", "LinkedIn", "https://linkedin.com/in/username", undefined, "url")}
                                {textField("twitterUrl", "X / Twitter", "https://x.com/username", undefined, "url")}
                                <div className="border-t pt-6">{textField("resumeUrl", "Resume / CV", "https://…", "ลิงก์ไปยังไฟล์หรือหน้าเรซูเม่ที่เปิดให้ผู้เข้าชมเข้าถึงได้", "url")}</div>
                            </Panel>}
                            {active === "appearance" && <>
                                <Panel title="ธีมตามเทศกาล" description="เปลี่ยนบรรยากาศเว็บไซต์ให้เข้ากับแต่ละเดือน โดยอิงเวลาไทย">
                                    <FormField control={form.control} name="autoSeasonalTheme" render={({ field }) => <FormItem className="flex items-start justify-between gap-5 rounded-xl border bg-muted/20 p-5"><div className="space-y-2"><FormLabel>เปลี่ยนธีมอัตโนมัติ</FormLabel><FormDescription className="max-w-lg leading-6">เปิดให้เว็บไซต์เลือกธีมประจำเดือน ผู้เข้าชมยังเลือกธีมอื่นจาก Navbar ได้ หากปิด จะใช้ธีมที่ผู้เข้าชมเลือกไว้</FormDescription></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} disabled={isSaving} /></FormControl></FormItem>} />
                                    <div className="flex items-center gap-3 rounded-xl bg-primary/5 px-4 py-3"><span className={"h-2 w-2 rounded-full " + (values.autoSeasonalTheme ? "bg-emerald-500" : "bg-muted-foreground")} /><p className="text-sm">{values.autoSeasonalTheme ? "เปิดโหมดอัตโนมัติ" : "เลือกธีมด้วยตนเอง"}{isDirty && <span className="text-muted-foreground"> · รอการบันทึก</span>}</p></div>
                                </Panel>
                                <Panel title="ปฏิทินธีม 12 เดือน" description="เทศกาลสากลตลอดปี พร้อมสงกรานต์ในเดือนเมษายน">
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{FESTIVAL_THEMES.map((theme, index) => <div key={theme.id} className={"flex items-center gap-3 rounded-xl border p-4 " + (theme.id === currentFestival ? "border-primary/50 bg-primary/5" : "bg-background/50")}><span className={theme.id + " flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-primary text-sm font-semibold text-primary-foreground"}>{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><p className="text-[11px] text-muted-foreground">{theme.month}{theme.id === currentFestival && " · เดือนนี้"}</p><p className="mt-0.5 text-sm font-medium">{theme.label}</p></div></div>)}</div>
                                    <p className="text-xs leading-6 text-muted-foreground">เปลี่ยนตามเดือน ไม่ใช่วันเทศกาลตามปฏิทินจันทรคติ</p>
                                </Panel>
                            </>}
                        </div>
                    </div>
                    <div className="sticky bottom-0 z-40 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur-xl sm:px-5">
                        <p role="status" aria-live="polite" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">{uploading ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังอัปโหลดรูป…</> : isDirty ? <><span className="h-2 w-2 rounded-full bg-amber-500" />มีการเปลี่ยนแปลงที่ยังไม่บันทึก</> : <><Check className="h-4 w-4 text-emerald-500" />ข้อมูลเป็นปัจจุบัน</>}</p>
                        <div className="flex w-full gap-2 sm:w-auto"><Button type="button" variant="ghost" disabled={!isDirty || busy} onClick={() => form.reset()} className="flex-1 sm:flex-none"><RotateCcw className="h-4 w-4" />คืนค่า</Button><Button type="submit" disabled={!isDirty || busy} className="flex-1 sm:flex-none">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{isSaving ? "กำลังบันทึก…" : "บันทึกการตั้งค่า"}</Button></div>
                    </div>
                </form>
            </Form>
        </div>
    )
}
