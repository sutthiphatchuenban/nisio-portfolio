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

    return {
        metadataBase: new URL(siteUrl),
        title: {
            default: siteName,
            template: `%s | ${siteName}`,
        },
        description: description,
        keywords: siteConfig.keywords,
        authors: [{ name: siteConfig.author.name }],
        creator: siteConfig.author.name,
        publisher: siteConfig.author.name,
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
            locale: "en_US",
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
