import prisma from '@/lib/prisma'
import { siteConfig } from '@/lib/config'

export interface SiteSettings {
    siteName: string
    siteDescription: string
    name: string
    title: string
    bio: string | null
    avatar: string | null
    email: string | null
    location: string | null
    resumeUrl: string | null
    githubUrl: string | null
    linkedinUrl: string | null
    twitterUrl: string | null
}

const DEFAULT_SETTINGS_ID = 'default'

// Server-side function to get site settings
export async function getSiteSettings(): Promise<SiteSettings> {
    try {
        let settings = await prisma.siteSettings.findUnique({
            where: { id: DEFAULT_SETTINGS_ID }
        })

        if (!settings) {
            // Return default values if no settings exist
            return {
                siteName: siteConfig.name,
                siteDescription: siteConfig.description,
                name: 'Your Name',
                title: 'Full Stack Developer',
                bio: null,
                avatar: null,
                email: null,
                location: null,
                resumeUrl: null,
                githubUrl: null,
                linkedinUrl: null,
                twitterUrl: null,
            }
        }

        return settings
    } catch (error) {
        console.error('Failed to fetch site settings:', error)
        // Return fallback values on error
        return {
            siteName: siteConfig.name,
            siteDescription: siteConfig.description,
            name: 'Your Name',
            title: 'Full Stack Developer',
            bio: null,
            avatar: null,
            email: null,
            location: null,
            resumeUrl: null,
            githubUrl: null,
            linkedinUrl: null,
            twitterUrl: null,
        }
    }
}
