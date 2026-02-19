import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig, getAbsoluteUrl } from "@/lib/config";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    width: "device-width",
    initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    const siteUrl = siteConfig.url;
    const siteName = settings.siteName || siteConfig.name;
    const description = settings.siteDescription || siteConfig.description;
    const ogImage = (settings as any)?.heroImage || siteConfig.ogImage || "/og-image.png";
    
    // Author names for SEO
    const thaiName = "สุทธิภัทร ชื่นบาน";
    const englishName = "Sutthiphat Chuenban";
    const authorName = settings?.name || `${thaiName} (${englishName})`;

    return {
        metadataBase: new URL(siteUrl),
        verification: {
            google: "9Jx-xpjz5bJAU2otpr_Qw9PkO6b5glead7P7V4Uokm8",
        },
        title: {
            default: `${siteName} - ${thaiName} Portfolio`,
            template: `%s | ${siteName}`,
        },
        description: `${description} | Portfolio by ${thaiName} (${englishName}) - ${settings?.title || "Full Stack Developer"}`,
        keywords: [
            ...siteConfig.keywords,
            thaiName,
            englishName,
            "สุทธิภัทร",
            "ชื่นบาน",
            "Sutthiphat",
            "Chuenban",
            "นักพัฒนาไทย",
        ],
        authors: [
            { name: thaiName },
            { name: englishName },
            { name: authorName }
        ],
        creator: englishName,
        publisher: englishName,
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                "max-video-preview": -1,
                "max-image-preview": "large",
                "max-snippet": -1,
            },
        },
        openGraph: {
            type: "website",
            locale: "th_TH",
            url: siteUrl,
            siteName: siteName,
            title: siteName,
            description: description,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: siteName,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: siteName,
            description: description,
            images: [ogImage],
            creator: siteConfig.author.twitter,
        },
        alternates: {
            canonical: siteUrl,
        },
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon-16x16.png",
            apple: "/apple-touch-icon.png",
        },
        manifest: "/site.webmanifest",
    };
}

import { ThemeEffects } from "@/components/shared/ThemeEffects";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
            >
                <Providers>
                    <ThemeEffects />
                    <AnalyticsTracker />
                    {children}
                </Providers>
                <Toaster />
            </body>
        </html>
    );
}
