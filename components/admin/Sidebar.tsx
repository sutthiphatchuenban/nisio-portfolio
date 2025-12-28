"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { LayoutDashboard, FolderKanban, Wrench, Mail, LogOut, Settings, Menu, FileText } from "lucide-react"
import { signOut } from "next-auth/react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

const sidebarItems = [
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
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4 gap-2">
            {sidebarItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                        pathname === item.href
                            ? "bg-muted text-primary"
                            : "text-muted-foreground"
                    )}
                >
                    <item.icon className="h-4 w-4" />
                    {item.title}
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
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden fixed top-4 right-4 z-50">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
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
                <div className="flex flex-col h-[calc(100vh-80px)]">
                    <div className="flex-1">
                        <SidebarContent
                            pathname={pathname ?? ''}
                            onLinkClick={() => setOpen(false)}
                        />
                    </div>
                    <div className="mt-auto p-4 border-t">
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
        </Sheet>
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
            <div className="hidden border-r bg-muted/40 md:block w-64 min-h-screen">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <span className="">{settings?.siteName || "PORTX"} Admin</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <SidebarContent pathname={pathname ?? ''} />
                </div>
                <div className="mt-auto p-4 border-t">
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
