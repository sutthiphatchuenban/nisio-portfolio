"use client"

import { useEffect, useRef, useState } from "react"
import { Monitor, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface HeroPreviewValues {
    heroImage: string
    heroImageMobile: string
    name: string
    title: string
    siteName: string
}

export function HeroPreview({ values }: { values: HeroPreviewValues }) {
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop")
    const [availableWidth, setAvailableWidth] = useState(0)
    const container = useRef<HTMLDivElement>(null)
    const frame = useRef<HTMLIFrameElement>(null)
    const width = device === "desktop" ? 1440 : 390
    const height = device === "desktop" ? 900 : 844
    const scale = Math.min(1, availableWidth / width)
    const latest = useRef(values)
    latest.current = values

    const send = () => frame.current?.contentWindow?.postMessage({ type: "settings-hero-preview", values: latest.current, theme: document.documentElement.className }, window.location.origin)

    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => setAvailableWidth(entry.contentRect.width))
        if (container.current) observer.observe(container.current)
        const ready = (event: MessageEvent) => {
            if (event.origin === window.location.origin && event.source === frame.current?.contentWindow && event.data?.type === "settings-preview-ready") send()
        }
        window.addEventListener("message", ready)
        return () => { observer.disconnect(); window.removeEventListener("message", ready) }
    }, [])

    useEffect(() => { send() }, [values])

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div><h3 className="font-semibold">ตัวอย่างบนหน้าเว็บไซต์</h3><p className="mt-1 text-xs text-muted-foreground">แสดงการครอปและข้อความจาก Hero ที่ใช้งานจริง</p></div>
                <div className="flex gap-1 rounded-lg border bg-muted/40 p-1" aria-label="ขนาดตัวอย่าง">
                    <Button type="button" size="sm" variant={device === "desktop" ? "secondary" : "ghost"} aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor />Desktop</Button>
                    <Button type="button" size="sm" variant={device === "mobile" ? "secondary" : "ghost"} aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone />Mobile</Button>
                </div>
            </div>
            <div ref={container} className="w-full min-w-0 overflow-hidden rounded-xl border bg-muted/30 p-0">
                <div className="mx-auto overflow-hidden" style={{ width: width * scale, height: height * scale }}>
                    <iframe ref={frame} title={`Hero preview ${device} ${width} × ${height}`} src="/admin/settings-preview" tabIndex={-1} onLoad={send} className="origin-top-left border-0 pointer-events-none" style={{ width, height, transform: `scale(${scale})`, maxWidth: "none" }} />
                </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">Viewport {width} × {height} px · ย่อแสดงผล {Math.round(scale * 100)}% · ยังไม่บันทึกการเปลี่ยนแปลง{device === "mobile" && " · ถ้าไม่ใส่รูปมือถือ ระบบจะใช้รูป Desktop"}</p>
        </div>
    )
}
