import { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/api/",
                    "/_next/",
                    "/private/",
                ],
            },
            {
                userAgent: "Googlebot",
                allow: "/",
                disallow: [
                    "/admin/",
                    "/api/",
                ],
            },
            {
                userAgent: "Googlebot-Image",
                allow: "/",
            },
        ],
        sitemap: `${siteConfig.url}/sitemap.xml`,
        host: siteConfig.url,
    }
}
