"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface SiteSettings {
    siteName: string
    siteDescription: string
    name: string
    title: string
    bio: string
    avatar: string
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
    siteName: "PORTX",
    siteDescription: "Personal portfolio website",
    name: "",
    title: "",
    bio: "",
    avatar: "",
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

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings")
            if (res.ok) {
                const data = await res.json()
                setSettings(data)
            } else {
                setSettings(defaultSettings)
            }
        } catch {
            setSettings(defaultSettings)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

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
