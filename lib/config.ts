// Site Configuration - Default/Fallback Values
// These values are used as defaults. Admin can override via Settings page.

export const siteConfig = {
    // Default site name - can be changed in admin settings
    name: "PORTX",

    // Default site description - can be changed in admin settings
    description: "Personal portfolio website showcasing projects, skills, and blog posts about web development.",

    // Site URL - your production domain
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",

    // SEO Keywords
    keywords: [
        "portfolio",
        "developer",
        "web developer",
        "full stack developer",
        "frontend developer",
        "backend developer",
        "projects",
        "blog",
        "programming",
        "javascript",
        "typescript",
        "react",
        "nextjs",
        "web development"
    ],

    // Author info
    author: {
        name: "Your Name",
        twitter: "@yourhandle",
    },

    // Social links
    social: {
        github: "https://github.com/yourhandle",
        linkedin: "https://linkedin.com/in/yourhandle",
        twitter: "https://twitter.com/yourhandle",
    },

    // Open Graph defaults
    og: {
        type: "website",
        locale: "en_US",
        siteName: "PORTX",
    },
}

// Helper function to generate page title
export function getPageTitle(siteName: string, pageTitle?: string): string {
    if (!pageTitle) return siteName
    return `${pageTitle} | ${siteName}`
}

// Helper function to generate absolute URL
export function getAbsoluteUrl(path: string): string {
    const baseUrl = siteConfig.url.replace(/\/$/, "")
    const cleanPath = path.startsWith("/") ? path : `/${path}`
    return `${baseUrl}${cleanPath}`
}

// Helper function to generate Open Graph image URL
export function getOgImageUrl(title: string, description?: string): string {
    // You can use a service like Vercel OG or create a custom OG image endpoint
    // For now, return a default OG image
    return `${siteConfig.url}/og-image.png`
}
