"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { useSession } from "next-auth/react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

const labels: Record<string, string> = { dashboard: "Overview", projects: "Projects", blog: "Blog", videos: "Videos", skills: "Skills", messages: "Messages", settings: "Settings" }

export function AdminTopbar() {
    const pathname = usePathname()
    const { data: session } = useSession()
    const label = labels[pathname?.split("/")[2] || "dashboard"] || "Workspace"
    return <header className="sticky top-0 z-30 hidden h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/90 px-7 backdrop-blur-xl lg:flex">
        <div className="flex items-center gap-3 text-xs"><span className="text-muted-foreground">Workspace</span><ChevronRight className="h-3 w-3 text-muted-foreground" /><span className="font-medium">{label}</span></div>
        <div className="flex items-center gap-5"><Link href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">เปิดเว็บไซต์<ArrowUpRight className="h-3.5 w-3.5" /></Link><ThemeToggle /><div title={session?.user?.name || "Admin"} className="flex h-8 w-8 items-center justify-center rounded-full border bg-primary/10 text-xs font-semibold text-primary">{session?.user?.name?.slice(0, 1).toUpperCase() || "A"}</div></div>
    </header>
}
