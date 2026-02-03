"use client"

import { SessionProvider } from "next-auth/react"
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider"
import { ThemeProvider } from "@/components/providers/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider
                attribute="class"
                defaultTheme="dark"
                themes={["light", "dark", "lol", "cyberpunk", "sakura", "christmas"]}
                enableSystem={false}
                disableTransitionOnChange
            >
                <SiteSettingsProvider>
                    {children}
                </SiteSettingsProvider>
            </ThemeProvider>
        </SessionProvider>
    )
}
