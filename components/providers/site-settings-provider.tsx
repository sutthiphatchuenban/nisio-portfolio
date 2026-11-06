"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

interface SiteSettings {
    autoSeasonalTheme: boolean
    siteName: string
    siteDescription: string
    name: string
    title: string
    bio: string
    avatar: string
    heroImage: string
    email: string
    location: string
    resumeUrl: string
    githubUrl: string
    linkedinUrl: string
    twitterUrl: string
}

interface SiteSettingsContextType {
    settings: SiteSettings | null
    isLoading: boolean
    refetch: () => Promise<void>
}

const defaultSettings: SiteSettings = {
    autoSeasonalTheme: false,
    siteName: "PORTX",
    siteDescription: "Personal portfolio website",
    name: "",
    title: "",
    bio: "",
    avatar: "",
    heroImage: "",
    email: "",
    location: "",
    resumeUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    twitterUrl: "",
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
    settings: defaultSettings,
    isLoading: true,
    refetch: async () => { },
})

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchSettings = useCallback(async () => {
        try {
            const res = await fetch("/api/settings", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                setSettings({ ...data, autoSeasonalTheme: data.autoSeasonalTheme === true })
            } else {
                setSettings(current => current || defaultSettings)
            }
        } catch {
            setSettings(current => current || defaultSettings)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchSettings()
        const onFocus = () => { void fetchSettings() }
        window.addEventListener("focus", onFocus)
        return () => window.removeEventListener("focus", onFocus)
    }, [fetchSettings])

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refetch: fetchSettings }}>
            {children}
        </SiteSettingsContext.Provider>
    )
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext)
    if (!context) {
        throw new Error("useSiteSettings must be used within a SiteSettingsProvider")
    }
    return context
}
