"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { pixelIconUrl } from "@/lib/pixel-brand"

export function PixelBrand() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    return (
        <>
            <Image src={pixelIconUrl(mounted ? resolvedTheme : undefined)} alt="" width={36} height={36} loading="eager" unoptimized />
            <span className="flex flex-col gap-0.5 leading-none">
                <span className="text-[17px] font-extrabold tracking-[0.1em]">NISIO</span>
                <span className="font-mono text-[9px] font-semibold tracking-[0.22em]">PORTFOLIO</span>
            </span>
        </>
    )
}

export function ThemedFavicon() {
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        if (!resolvedTheme) return

        const icon = document.createElement("link")
        icon.rel = "icon"
        icon.type = "image/svg+xml"
        icon.sizes.add("any")
        icon.href = pixelIconUrl(resolvedTheme)
        const preferThemedIcon = () => {
            // Next can reinsert its fallback icons after a client-side navigation.
            const links = document.head.querySelectorAll('link[rel~="icon"]')
            if (links[links.length - 1] !== icon) document.head.append(icon)
        }
        preferThemedIcon()
        const observer = new MutationObserver(preferThemedIcon)
        observer.observe(document.head, { childList: true })
        return () => {
            observer.disconnect()
            icon.remove()
        }
    }, [resolvedTheme])

    return null
}
