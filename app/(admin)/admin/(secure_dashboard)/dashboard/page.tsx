"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import axios from "axios"
import { ArrowUpRight, Eye, Users, MessageSquare, FolderKanban, Plus, FileText, Palette, Loader2, Clock } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { AdminPageHeader, AdminEmpty } from "@/components/admin/AdminPage"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface DashboardData {
    stats: { totalVisits: number; uniqueVisitors: number; avgSessionDuration: number; bounceRate: number; projectCount: number; unreadMessages: number }
    topPages: { path: string; views: number }[]
    recentMessages: { id: string; name: string; email: string; message: string; createdAt: string; status: string }[]
    recentProjects: { id: string; title: string; updatedAt: string; status: string }[]
    dailyStats: { date: string; views: number }[]
}

function DashboardPanel({ title, description, href, children }: { title: string; description: string; href?: string; children: React.ReactNode }) {
    return <section className="min-w-0 overflow-hidden rounded-2xl border bg-card"><div className="flex items-start justify-between gap-3 border-b p-5 sm:px-6"><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs leading-6 text-muted-foreground">{description}</p></div>{href && <Link href={href} className="flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">ดูทั้งหมด<ArrowUpRight className="h-3.5 w-3.5" /></Link>}</div><div className="p-5 sm:p-6">{children}</div></section>
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    async function fetchData() {
        setLoading(true)
        try { const response = await axios.get("/api/analytics/overview"); setData(response.data) }
        catch { setData(null) }
        finally { setLoading(false) }
    }
    useEffect(() => { fetchData() }, [])

    if (loading) return <div role="status" className="space-y-6"><div className="flex items-center gap-3 py-8 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />กำลังโหลดภาพรวมเว็บไซต์…</div><div className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[1,2,3,4].map(item=><div key={item} className="h-36 animate-pulse rounded-2xl border bg-card" />)}</div><div className="h-80 animate-pulse rounded-2xl border bg-card" /></div>
    if (!data) return <div className="rounded-2xl border bg-card p-8 text-center"><h1 className="text-xl font-semibold">โหลดภาพรวมไม่ได้</h1><p className="my-4 text-sm text-muted-foreground">ลองเชื่อมต่ออีกครั้งเพื่อดูข้อมูลล่าสุด</p><Button onClick={fetchData}>ลองอีกครั้ง</Button></div>

    const stats = [
        { title: "ยอดเข้าชมทั้งหมด", value: data.stats.totalVisits, icon: Eye, caption: "Page views · ตั้งแต่เริ่มเก็บข้อมูล", href: "#traffic" },
        { title: "ผู้เข้าชมไม่ซ้ำ", value: data.stats.uniqueVisitors, icon: Users, caption: "แยกตาม session ของผู้เข้าชม", href: "#traffic" },
        { title: "ข้อความรออ่าน", value: data.stats.unreadMessages, icon: MessageSquare, caption: data.stats.unreadMessages ? "มีข้อความใหม่ที่รอคุณอยู่" : "อ่านครบทุกข้อความแล้ว", href: "/admin/messages" },
        { title: "โปรเจกต์ทั้งหมด", value: data.stats.projectCount, icon: FolderKanban, caption: "ผลงานในพอร์ตโฟลิโอของคุณ", href: "/admin/projects" },
    ]
    const mostViews = Math.max(1, ...data.topPages.map(page => page.views))
    return <div className="space-y-7">
        <AdminPageHeader eyebrow="Overview" title="ภาพรวมเว็บไซต์" description="ดูความเคลื่อนไหวของพอร์ตโฟลิโอและจัดการสิ่งสำคัญได้จากที่เดียว"><Button asChild className="rounded-xl"><Link href="/admin/projects"><Plus className="h-4 w-4" />จัดการผลงาน</Link></Button></AdminPageHeader>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{stats.map(stat=><Link key={stat.title} href={stat.href} className="group min-w-0 rounded-2xl border bg-card p-4 sm:p-5 transition-colors hover:border-primary/40"><div className="flex items-center justify-between"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><stat.icon className="h-4 w-4" /></div><ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary" /></div><p className="mt-5 text-3xl font-semibold tabular-nums tracking-tight">{stat.value.toLocaleString()}</p><p className="mt-2 text-sm font-medium">{stat.title}</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{stat.caption}</p></Link>)}</div>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
            <div id="traffic" className="min-w-0 scroll-mt-20"><DashboardPanel title="การเข้าชมเว็บไซต์" description="ยอดเข้าชมรายวันในช่วง 30 วันที่ผ่านมา">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />Page views</p><span className="rounded-full border px-3 py-1.5 text-[10px] text-muted-foreground">30 วันล่าสุด</span></div>
                {data.dailyStats.length ? <div className="h-64 min-w-0 sm:h-72"><ResponsiveContainer width="100%" height="100%" minWidth={0}><AreaChart data={data.dailyStats} margin={{top:10,right:8,left:-25,bottom:0}}><defs><linearGradient id="adminTrafficFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} /><XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} tick={{fill:"var(--muted-foreground)"}} tickFormatter={date=>format(new Date(date),"d MMM")} /><YAxis allowDecimals={false} fontSize={10} tickLine={false} axisLine={false} tick={{fill:"var(--muted-foreground)"}} /><Tooltip contentStyle={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,color:"var(--foreground)",fontSize:12}} labelFormatter={date=>format(new Date(String(date)),"d MMM yyyy")} /><Area name="ยอดเข้าชม" type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} fill="url(#adminTrafficFill)" /></AreaChart></ResponsiveContainer></div> : <AdminEmpty icon={Eye} title="ยังไม่มีข้อมูลการเข้าชม" description="กราฟจะแสดงเมื่อมีผู้เข้าชมเว็บไซต์ในช่วง 30 วันที่ผ่านมา" />}
                <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-5"><div><p className="text-xs text-muted-foreground">ระยะเวลาเฉลี่ยที่บันทึกได้</p><p className="mt-2 flex items-center gap-2 font-semibold"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{Math.round(data.stats.avgSessionDuration)} วินาที</p></div><div><p className="text-xs text-muted-foreground">Session ที่เข้าชมหน้าเดียว</p><p className="mt-2 font-semibold">{data.stats.bounceRate.toFixed(1)}%</p></div></div>
            </DashboardPanel></div>
            <DashboardPanel title="หน้าที่มีผู้เข้าชมมากที่สุด" description="5 อันดับแรก · ตั้งแต่เริ่มเก็บข้อมูล">
                {data.topPages.length ? <div className="space-y-6">{data.topPages.map((page,index)=><div key={page.path}><div className="mb-2 flex min-w-0 items-center gap-3 text-xs"><span className="text-[10px] text-muted-foreground">{String(index+1).padStart(2,"0")}</span><span className="min-w-0 flex-1 truncate font-medium" title={page.path}>{page.path}</span><span className="tabular-nums text-muted-foreground">{page.views.toLocaleString()}</span></div><div className="ml-6 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/65" style={{width:page.views/mostViews*100+"%"}} /></div></div>)}</div> : <AdminEmpty icon={Eye} title="ยังไม่มีข้อมูล" description="อันดับหน้าจะแสดงเมื่อเริ่มมีการเข้าชม" />}
            </DashboardPanel>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
            <DashboardPanel title="ข้อความล่าสุด" description="การติดต่อผ่านแบบฟอร์มบนเว็บไซต์" href="/admin/messages">
                {data.recentMessages.length ? <div className="space-y-5">{data.recentMessages.map(message=><Link key={message.id} href="/admin/messages" className="group flex min-w-0 items-start gap-3 border-b pb-5 last:border-0 last:pb-0"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{message.name.slice(0,1).toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium group-hover:text-primary">{message.name}</p><time className="text-[10px] text-muted-foreground">{format(new Date(message.createdAt),"d MMM yyyy")}</time></div><p className="mt-1 line-clamp-2 break-words text-xs leading-6 text-muted-foreground">{message.message}</p></div>{message.status === "pending" && <span aria-label="ยังไม่ได้อ่าน" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />}</Link>)}</div> : <AdminEmpty icon={MessageSquare} title="ยังไม่มีข้อความ" description="ข้อความจากผู้เข้าชมจะแสดงที่นี่" />}
            </DashboardPanel>
            <DashboardPanel title="ผลงานที่อัปเดตล่าสุด" description="ความเคลื่อนไหวของเนื้อหาในพอร์ตโฟลิโอ" href="/admin/projects">
                {data.recentProjects.length ? <div className="space-y-5">{data.recentProjects.map(project=><Link key={project.id} href="/admin/projects" className="flex min-w-0 items-center gap-3 border-b pb-5 last:border-0 last:pb-0"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-muted/40"><FolderKanban className="h-4 w-4 text-muted-foreground" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-medium">{project.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{format(new Date(project.updatedAt),"d MMM yyyy · HH:mm")}</p></div><Badge variant={project.status === "published" ? "default" : "secondary"} className="text-[10px]">{project.status === "published" ? "เผยแพร่แล้ว" : project.status === "draft" ? "ฉบับร่าง" : "เก็บถาวร"}</Badge></Link>)}</div> : <AdminEmpty icon={FolderKanban} title="ยังไม่มีโปรเจกต์" description="เริ่มสร้างพอร์ตโฟลิโอด้วยผลงานชิ้นแรกของคุณ" />}
            </DashboardPanel>
        </div>
        <section className="rounded-2xl border bg-card p-5 sm:p-6"><p className="mb-4 text-xs font-medium text-muted-foreground">ไปที่การจัดการ</p><div className="grid gap-3 sm:grid-cols-3">{[{href:"/admin/blog",label:"จัดการบทความ",description:"แบ่งปันความรู้และเรื่องราว",icon:FileText},{href:"/admin/projects",label:"จัดการโปรเจกต์",description:"เพิ่มผลงานในพอร์ตโฟลิโอ",icon:FolderKanban},{href:"/admin/settings",label:"ปรับแต่งเว็บไซต์",description:"รูปภาพ โปรไฟล์ และธีม",icon:Palette}].map(item=><Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 hover:bg-primary/5"><item.icon className="h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="text-sm font-medium">{item.label}</p><p className="mt-1 text-[10px] text-muted-foreground">{item.description}</p></div><ArrowUpRight className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground" /></Link>)}</div></section>
    </div>
}
