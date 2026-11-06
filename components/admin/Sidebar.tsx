"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LayoutDashboard, FolderKanban, Wrench, Mail, LogOut, Settings, Menu, FileText, Video, ArrowUpRight, ChevronRight, Bot } from "lucide-react"
import { signOut } from "next-auth/react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"
import { ThemeToggle } from "@/components/shared/ThemeToggle"


const sidebarItems = [
    { title: "AI Agent", href: "/admin/agent", icon: Bot },
    {
        title: "Overview",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Projects",
        href: "/admin/projects",
        icon: FolderKanban,
    },
    {
        title: "Blog",
        href: "/admin/blog",
        icon: FileText,
    },
    {
        title: "Videos",
        href: "/admin/videos",
        icon: Video,
    },
    {
        title: "Skills",
        href: "/admin/skills",
        icon: Wrench,
    },
    {
        title: "Messages",
        href: "/admin/messages",
        icon: Mail,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
]

// Navigation content ที่ใช้ร่วมกันทั้ง Desktop และ Mobile
function SidebarContent({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
    return (
        <nav aria-label="เมนูจัดการเว็บไซต์" className="grid items-start gap-1 px-3 py-3 text-sm font-medium">
            {sidebarItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className={cn(
                        "group flex min-h-11 items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-muted/70 hover:text-foreground",
                        pathname === item.href
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {pathname === item.href && <ChevronRight className="ml-auto h-3.5 w-3.5" />}
                </Link>
            ))}
        </nav>
    )
}

// Mobile Sidebar with Sheet
export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const pathname = usePathname()
    const { settings } = useSiteSettings()

    return (
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-3 border-b bg-background px-4 lg:hidden"><Link href="/" className="min-w-0 truncate text-sm font-semibold">{settings?.siteName || "PORTX"} Admin</Link><div className="flex items-center gap-2"><ThemeToggle /><Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-11 w-11">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,85vw)] overflow-y-auto p-0">
                <SheetHeader className="border-b px-4 py-4">
                    <SheetTitle>
                        <Link
                            href="/"
                            className="flex items-center gap-2 font-semibold"
                            onClick={() => setOpen(false)}
                        >
                            {settings?.siteName || "PORTX"} Admin
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col min-h-[calc(100svh-80px)]">
                    <div className="flex-1">
                        <SidebarContent
                            pathname={pathname ?? ''}
                            onLinkClick={() => setOpen(false)}
                        />
                    </div>
                    <div className="mx-3 mb-3 mt-auto space-y-2 rounded-xl border bg-muted/25 p-3">
                    <Link href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground">ดูเว็บไซต์ของคุณ<ArrowUpRight className="h-3.5 w-3.5" /></Link>
                        <Button
                            variant="outline"
                            className="w-full justify-start gap-2"
                            onClick={() => signOut({ callbackUrl: '/' })}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet></div></div>
    )
}

// Desktop Sidebar
export function AdminSidebar() {
    const pathname = usePathname()
    const { settings } = useSiteSettings()

    return (
        <>
            {/* Mobile Sidebar */}
            <MobileSidebar />

            {/* Desktop Sidebar */}
            <div className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col overflow-y-auto border-r bg-background lg:flex">
                <div className="flex h-20 shrink-0 items-center gap-3 px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{(settings?.siteName || "N").slice(0,1)}</span><span><span className="block text-sm tracking-wide">{settings?.siteName || "PORTX"}</span><span className="mt-0.5 block text-[10px] font-normal uppercase tracking-[0.18em] text-muted-foreground">Admin workspace</span></span>
                    </Link>
                </div>
                <div className="flex-1">
                    <SidebarContent pathname={pathname ?? ''} />
                </div>
                <div className="mx-3 mb-3 mt-auto space-y-2 rounded-xl border bg-muted/25 p-3">
                    <Link href="/" target="_blank" rel="noopener noreferrer" className="flex min-h-10 items-center justify-between gap-2 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground">ดูเว็บไซต์ของคุณ<ArrowUpRight className="h-3.5 w-3.5" /></Link>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </>
    )
}
