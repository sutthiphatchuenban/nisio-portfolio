// Site Configuration - Default/Fallback Values
// These values are used as defaults. Admin can override via Settings page.

export const siteConfig = {
    // Default site name - can be changed in admin settings
    name: "PORTX",

    // Default site description - can be changed in admin settings
    description: "Personal portfolio website",

    // Site URL - your production domain
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

    // SEO Keywords
    keywords: ["portfolio", "developer", "projects", "blog"],
}

// Helper function to generate page title
export function getPageTitle(siteName: string, pageTitle?: string): string {
    if (!pageTitle) return siteName
    return `${pageTitle} | ${siteName}`
}
