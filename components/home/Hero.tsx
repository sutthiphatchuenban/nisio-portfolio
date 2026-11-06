"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

interface HeroProps {
    heroImage?: string
    heroImageMobile?: string
    name?: string
    title?: string
}

function optimizeCloudinaryImage(url: string, width: number) {
    const segment = "/image/upload/"
    return url.includes("res.cloudinary.com") && url.includes(segment)
        ? url.replace(segment, `${segment}f_auto,q_auto,c_limit,w_${width}/`)
        : url
}

export default function Hero({ heroImage: heroImageProp, heroImageMobile: heroImageMobileProp, name: nameProp, title: titleProp }: HeroProps) {
    const { settings } = useSiteSettings()
    const heroImage = heroImageProp || settings?.heroImage || "/hero_bg.jpg"
    const heroImageMobile = heroImageMobileProp || (settings as any)?.heroImageMobile || heroImage
    const name = nameProp || settings?.name || "Sutthiphat Chuenban"
    const title = titleProp || settings?.title || "Full Stack Developer"

    return <HeroView heroImage={heroImage} heroImageMobile={heroImageMobile} name={name} title={title} />
}

export function HeroView({ heroImage = "/hero_bg.jpg", heroImageMobile = heroImage, name = "Sutthiphat Chuenban", title = "Full Stack Developer" }: HeroProps) {

    return (
        <section className="portfolio-hero relative isolate overflow-hidden bg-[#151513] text-[#f9f7f1]">
            <div className="absolute inset-0 -z-20 hidden md:block">
                <Image src={optimizeCloudinaryImage(heroImage, 1600)} alt="" fill priority sizes="100vw" className="object-cover object-center" unoptimized />
            </div>
            <div className="absolute inset-x-0 top-0 -z-20 h-[480px] md:hidden">
                <Image src={optimizeCloudinaryImage(heroImageMobile, 900)} alt="" fill priority sizes="100vw" className="object-cover object-center" unoptimized />
            </div>
            <div className="portfolio-hero-overlay absolute inset-0 -z-10" />
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#11110f]/65 via-transparent to-[#11110f]/15" />

            <div className="container flex min-h-[calc(100svh-3.5rem)] flex-col justify-end pb-8 pt-[340px] md:justify-center md:py-20">
                <div className="max-w-[650px] pb-12 md:pb-16">
                    <div className="mb-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--hero-accent)] sm:text-xs">
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--hero-accent)]" aria-hidden="true" />
                        <span>Personal portfolio <span className="mx-2 hidden text-white/35 sm:inline">/</span><span className="mt-2 block leading-relaxed sm:mt-0 sm:inline">{title}</span></span>
                    </div>
                    <p className="mb-3 font-serif text-xl italic text-white/75 sm:text-2xl">Hello, I’m</p>
                    <h1 className="max-w-[10ch] text-[clamp(3.2rem,7vw,6.75rem)] font-semibold leading-[0.98] tracking-[-0.055em]">{name}<span className="text-[var(--hero-accent)]">.</span></h1>
                    <p className="mt-7 max-w-sm text-sm leading-7 text-white/75 sm:text-base">Exploring ideas, creating digital experiences, and sharing what I learn along the way.</p>
                    <div className="mt-8 flex flex-wrap items-center gap-3 sm:mt-10">
                        <Link href="/projects" className="group inline-flex h-12 items-center gap-7 rounded-full bg-[var(--hero-button)] px-6 text-sm font-semibold !text-[#171717] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                            Explore my work <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                        <Link href="/contact" className="inline-flex h-12 items-center rounded-full border border-white/35 px-6 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">Get in touch</Link>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/25 pt-5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/65">
                    <span>Ideas &nbsp;·&nbsp; Work &nbsp;·&nbsp; Stories</span>
                    <Link href="#content" className="flex items-center gap-2 transition-colors hover:text-white">Scroll to explore <ArrowDownRight className="h-4 w-4" /></Link>
                </div>
            </div>
        </section>
    )
}
