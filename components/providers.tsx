"use client"

import { SessionProvider } from "next-auth/react"
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

import { SeasonalThemeProvider } from "@/components/providers/seasonal-theme-provider"
import { THEME_IDS } from "@/lib/theme-catalog"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                themes={THEME_IDS}
                enableSystem={false}
                disableTransitionOnChange
            >
                <SiteSettingsProvider>
                    <SeasonalThemeProvider>{children}</SeasonalThemeProvider>
                </SiteSettingsProvider>
            </ThemeProvider>
        </SessionProvider>
    )
}
