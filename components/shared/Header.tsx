"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { LogOut, LayoutDashboard, LogIn, Menu } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

const navLinks = [
    { href: "/projects", label: "Projects" },
    { href: "/blog", label: "Blog" },
    { href: "/skills", label: "Skills" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
]

export function Header() {
    const [open, setOpen] = useState(false)
    const { data: session, status } = useSession()
    const { settings } = useSiteSettings()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center justify-between">
                {/* Logo - แสดงทุกขนาดหน้าจอ */}
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-bold">{settings?.siteName || "PORTX"}</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center">
                    <nav className="flex items-center space-x-6 text-sm font-medium mr-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="transition-colors hover:text-foreground/80 text-foreground/60"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <nav className="flex items-center gap-2">
                        {status === "loading" ? (
                            <Button variant="ghost" size="sm" disabled>Loading...</Button>
                        ) : session ? (
                            <>
                                <Link href="/admin/dashboard">
                                    <Button variant="ghost" size="sm">
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Link href="/admin/login">
                                <Button variant="ghost" size="sm">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Admin
                                </Button>
                            </Link>
                        )}
                        <ThemeToggle />
                    </nav>
                </div>

                {/* Mobile Menu */}
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[280px] sm:w-[300px] bg-background border-l">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <div className="flex flex-col h-full">
                            {/* Navigation Links */}
                            <nav className="flex-1 py-6 px-4">
                                <div className="space-y-1">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setOpen(false)}
                                            className="flex items-center py-3 text-base font-medium rounded-md transition-colors hover:text-primary"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>
                            </nav>

                            {/* Bottom Section */}
                            <div className="border-t pt-4 space-y-3">
                                {/* Admin Actions */}
                                {status === "loading" ? (
                                    <Button variant="ghost" disabled className="w-full justify-start">
                                        <span className="h-4 w-4 mr-2 animate-spin">⟳</span>
                                        Loading...
                                    </Button>
                                ) : session ? (
                                    <div className="space-y-1">
                                        <Link href="/admin/dashboard" onClick={() => setOpen(false)}>
                                            <Button variant="ghost" className="w-full justify-start">
                                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="w-full justify-start text-destructive hover:text-destructive"
                                            onClick={() => signOut({ callbackUrl: '/' })}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Logout
                                        </Button>
                                    </div>
                                ) : (
                                    <Link href="/admin/login" onClick={() => setOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Admin Login
                                        </Button>
                                    </Link>
                                )}

                                {/* Theme Toggle */}
                                <div className="flex items-center justify-between px-2 py-2">
                                    <span className="text-sm text-muted-foreground">Theme</span>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    )
}
