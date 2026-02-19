// Site Configuration - Default/Fallback Values
// These values are used as defaults. Admin can override via Settings page.

export const siteConfig = {
    // Default site name - can be changed in admin settings
    name: "NISIO PORTFOLIO",

    // Default site description - can be changed in admin settings
    description: "ผลงานและประสบการณ์ของ สุทธิภัทร ชื่นบาน พัฒนาเว็บไซต์และแอพพลิเคชั่น | Full Stack Developer Portfolio showcasing projects and skills in web development.",

    // Site URL - your production domain
    url: process.env.NEXT_PUBLIC_SITE_URL || "",

    // SEO Keywords
    keywords: [
        // Brand keywords
        "nisio",
        "NISIO",
        "NISIO PORTFOLIO",
        // English keywords
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
        "web development",
        "Sutthiphat Chuenban",
        // Thai keywords
        "สุทธิภัทร ชื่นบาน",
        "นักพัฒนาเว็บ",
        "โปรแกรมเมอร์",
        "พอร์ตโฟลิโอ",
        "พัฒนาเว็บไซต์",
        "ฟูลสแต็ค",
        "เว็บไซต์ส่วนตัว",
        "ประสบการณ์ทำงาน",
        "โปรเจค",
        "จาวาสคริปต์",
        "รีแอค",
        "เน็กซ์เจเอส",
    ],

    // Author info
    author: {
        name: "สุทธิภัทร ชื่นบาน (Sutthiphat Chuenban)",
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
        locale: "th_TH",
        siteName: "NISIO PORTFOLIO",
    },

    // Default OG Image
    ogImage: "/og-image.png",
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
