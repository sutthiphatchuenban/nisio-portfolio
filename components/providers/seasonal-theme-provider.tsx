"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import { useSiteSettings } from "@/components/providers/site-settings-provider"
import { getFestivalForDate, THEME_IDS } from "@/lib/theme-catalog"

const MODE_KEY = "portfolio-theme-mode"
const MANUAL_KEY = "portfolio-manual-theme"
type Mode = "site" | "auto" | "manual"
const SeasonalContext = createContext({ automatic: false, enabled: false, chooseTheme: (_id: string) => {}, chooseAutomatic: () => {} })

export function SeasonalThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useTheme()
    const { settings } = useSiteSettings()
    const [mode, setMode] = useState<Mode>("site")
    const [manual, setManual] = useState("dark")
    const [ready, setReady] = useState(false)
    const [season, setSeason] = useState<string | null>(null)
    const enabled = settings?.autoSeasonalTheme === true
    const automatic = enabled && mode !== "manual"

    useEffect(() => {
        const sync = () => {
            const savedMode = localStorage.getItem(MODE_KEY)
            setMode(savedMode === "auto" || savedMode === "manual" ? savedMode : "site")
            const savedTheme = localStorage.getItem(MANUAL_KEY) || localStorage.getItem("theme") || "dark"
            const validTheme = THEME_IDS.includes(savedTheme as typeof THEME_IDS[number]) ? savedTheme : "dark"
            if (!localStorage.getItem(MANUAL_KEY)) localStorage.setItem(MANUAL_KEY, validTheme)
            setManual(validTheme)
            setSeason(getFestivalForDate().id)
            setReady(true)
        }
        sync()
        const updateMonth = () => setSeason(getFestivalForDate().id)
        const timer = setInterval(updateMonth, 60000)
        const onStorage = (event: StorageEvent) => { if(event.key === MODE_KEY || event.key === MANUAL_KEY) sync() }
        window.addEventListener("storage", onStorage)
        window.addEventListener("focus", updateMonth)
        return () => { clearInterval(timer); window.removeEventListener("storage", onStorage); window.removeEventListener("focus", updateMonth) }
    }, [])

    useEffect(() => {
        if (!ready || !settings || !season) return
        const desired = automatic ? season : manual
        if (theme !== desired) setTheme(desired)
    }, [ready, settings, season, automatic, manual, theme, setTheme])

    const chooseTheme = useCallback((id: string) => {
        if (!THEME_IDS.includes(id as typeof THEME_IDS[number])) return
        localStorage.setItem(MANUAL_KEY, id)
        localStorage.setItem(MODE_KEY, "manual")
        setManual(id); setMode("manual"); setTheme(id)
    }, [setTheme])
    const chooseAutomatic = useCallback(() => {
        if (!enabled) return
        localStorage.setItem(MODE_KEY, "auto")
        setMode("auto"); setTheme(getFestivalForDate().id)
    }, [enabled, setTheme])

    return <SeasonalContext.Provider value={{ enabled, automatic, chooseTheme, chooseAutomatic }}>{children}</SeasonalContext.Provider>
}
export const useSeasonalTheme = () => useContext(SeasonalContext)
