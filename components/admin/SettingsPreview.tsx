"use client"

import { useEffect, useState } from "react"
import { HeroView } from "@/components/home/Hero"
import type { HeroPreviewValues } from "@/components/admin/HeroPreview"

export function SettingsPreview() {
    const [values, setValues] = useState<HeroPreviewValues>()

    useEffect(() => {
        const receive = (event: MessageEvent) => {
            if (event.origin !== window.location.origin || event.source !== window.parent || event.data?.type !== "settings-hero-preview") return
            const data = event.data.values
            if (!data || !["heroImage", "heroImageMobile", "name", "title", "siteName"].every(key => typeof data[key] === "string")) return
            setValues(data)
            if (typeof event.data.theme === "string") document.documentElement.className = event.data.theme
        }
        window.addEventListener("message", receive)
        window.parent.postMessage({ type: "settings-preview-ready" }, window.location.origin)
        return () => window.removeEventListener("message", receive)
    }, [])

    if (!values) return <div className="p-6 text-sm text-muted-foreground">กำลังโหลดตัวอย่าง…</div>
    return <div className="pointer-events-none">
        <style>{"html { scrollbar-width: none; } html::-webkit-scrollbar, nextjs-portal { display: none; }"}</style>
        <div className="h-14 border-b bg-background text-foreground"><div className="container flex h-full items-center justify-between"><span className="font-bold">{values.siteName || "PORTX"}</span><span className="text-xs text-muted-foreground">{values.name}</span></div></div>
        <HeroView heroImage={values.heroImage || "/hero_bg.jpg"} heroImageMobile={values.heroImageMobile || values.heroImage || "/hero_bg.jpg"} name={values.name || undefined} title={values.title || undefined} />
    </div>
}
