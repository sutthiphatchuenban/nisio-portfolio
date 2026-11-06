"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"

export function PublicShell({ children }: { children: React.ReactNode }) {
    const isMeetingRoom = usePathname()?.startsWith("/meeting/") === true
    const [viewportHeight, setViewportHeight] = useState<number>()

    useEffect(() => {
        if (!isMeetingRoom || !window.visualViewport) return
        const viewport = window.visualViewport
        const resize = () => {
            if (viewport.scale === 1) setViewportHeight(viewport.height)
        }
        resize()
        viewport.addEventListener("resize", resize)
        return () => viewport.removeEventListener("resize", resize)
    }, [isMeetingRoom])

    return (
        <div style={isMeetingRoom ? { height: viewportHeight } : undefined} className={`${isMeetingRoom ? "h-dvh overflow-hidden" : "min-h-screen"} flex flex-col bg-background font-sans antialiased`}>
            <Header />
            <main className={isMeetingRoom ? "min-h-0 flex-1 overflow-hidden" : "flex-1"}>{children}</main>
            {!isMeetingRoom && <Footer />}
        </div>
    )
}
