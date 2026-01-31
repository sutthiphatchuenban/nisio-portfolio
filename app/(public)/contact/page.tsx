import { ContactForm } from "@/components/contact/ContactForm"
import type { Metadata } from "next"
import { siteConfig, getAbsoluteUrl } from "@/lib/config"

// SEO Metadata for Contact Page
export const metadata: Metadata = {
    title: "Contact",
    description: `Get in touch with me for project inquiries, collaborations, or just to say hello. I'd love to hear from you!`,
    keywords: [
        "contact",
        "get in touch",
        "hire me",
        "freelance developer",
        "web developer contact",
        "software engineer contact",
        "collaboration",
        "project inquiry",
        ...siteConfig.keywords,
    ],
    alternates: {
        canonical: getAbsoluteUrl("/contact"),
    },
    openGraph: {
        title: `Contact | ${siteConfig.name}`,
        description: "Get in touch with me for project inquiries, collaborations, or just to say hello.",
        url: getAbsoluteUrl("/contact"),
        type: "website",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: `${siteConfig.name} - Contact`,
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: `Contact | ${siteConfig.name}`,
        description: "Get in touch with me for project inquiries, collaborations, or just to say hello.",
        images: ["/og-image.png"],
    },
}

// JSON-LD Structured Data for Contact Page
function JsonLd() {
    const contactPageSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": `Contact ${siteConfig.author.name}`,
        "description": "Get in touch for project inquiries and collaborations",
        "url": getAbsoluteUrl("/contact"),
        "mainEntity": {
            "@type": "Person",
            "name": siteConfig.author.name,
            "url": siteConfig.url,
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
        />
    )
}

export default function ContactPage() {
    return (
        <>
            <JsonLd />
            <div className="container max-w-2xl py-20">
                <div className="mb-10 text-center">
                    <h1 className="font-heading text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:leading-[1.1]">
                        Get in Touch
                    </h1>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Have a project in mind or just want to say hi? I'd love to hear from you.
                    </p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6 md:p-10">
                    <ContactForm />
                </div>
            </div>
        </>
    )
}
