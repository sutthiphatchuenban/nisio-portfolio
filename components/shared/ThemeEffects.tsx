"use client"

import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import ChristmasEffects from "@/components/shared/ChristmasEffects"
import SakuraEffects from "@/components/shared/SakuraEffects"

import HalloweenEffects from "@/components/shared/HalloweenEffects"

import MonthlyEffects, { MONTHLY_MOTIFS, type MonthlyTheme } from "@/components/shared/MonthlyEffects"

export function ThemeEffects() {
    const { theme } = useTheme()
    const pathname = usePathname()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])
    if (!mounted || pathname?.startsWith("/meeting/") || pathname?.startsWith("/admin/")) return null
    return <>
        {theme === "cyberpunk" && <div className="scanlines" />}
        {theme === "sakura" && <SakuraEffects />}
        {theme === "christmas" && <ChristmasEffects />}
        {theme === "halloween" && <HalloweenEffects />}
        {theme && Object.hasOwn(MONTHLY_MOTIFS, theme) && <MonthlyEffects key={theme} id={theme as MonthlyTheme} />}
    </>
}
