"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

interface HeroProps {
    heroImage?: string
    heroImageMobile?: string
    name?: string
    title?: string
}

export default function Hero({ heroImage: heroImageProp, heroImageMobile: heroImageMobileProp, name: nameProp, title: titleProp }: HeroProps) {
    const { settings } = useSiteSettings()
    const heroImage = heroImageProp || settings?.heroImage || "/hero_bg.jpg"
    const heroImageMobile = heroImageMobileProp || (settings as any)?.heroImageMobile || heroImage
    const name = nameProp || settings?.name || "Sutthiphat Chuenban"
    const title = titleProp || settings?.title || "Full Stack Developer"

    return (
        <>
            {/* Desktop - full screen with overlay text */}
            <section className="relative hidden md:block h-svh min-h-[600px] w-full overflow-hidden">
                <div className="absolute inset-0">
                    <Image
                        src={heroImage}
                        alt={name}
                        fill
                        priority
                        sizes="100vw"
                        className="object-cover"
                        unoptimized={true}
                    />
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                    <div className="container">
                        <p className="text-sm uppercase tracking-[0.3em] text-white/70">{title}</p>
                        <h1 className="mt-2 text-5xl font-bold text-white lg:text-6xl">
                            {name}
                        </h1>
                        <div className="mt-6 flex gap-3">
                            <Button asChild size="lg" className="h-12 rounded-full bg-white px-8 text-sm font-semibold text-black hover:bg-white/90">
                                <Link href="/projects">
                                    View Projects
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-white/30 bg-white/5 px-8 text-sm font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white">
                                <Link href="/contact">Contact</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <Link href="#content" className="text-white/50 transition-colors hover:text-white">
                        <ChevronDown className="h-6 w-6 animate-bounce" />
                    </Link>
                </div>
            </section>

            {/* Mobile - image full with text at bottom */}
            <section className="relative block md:hidden h-svh min-h-[600px] w-full overflow-hidden">
                <Image
                    src={heroImageMobile}
                    alt={name}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-[center_80%]"
                    unoptimized={true}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute inset-0 z-10 flex translate-y-6 flex-col items-center justify-center px-6 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/70">{title}</p>
                    <h1 className="mt-2 text-3xl font-bold text-white">
                        {name}
                    </h1>
                    <div className="mt-4 flex gap-3">
                        <Button asChild size="default" className="rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90">
                            <Link href="/projects">
                                View Projects
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="default" className="rounded-full border-white/30 bg-white/5 px-6 text-sm font-semibold text-white backdrop-blur hover:bg-white/10 hover:text-white">
                            <Link href="/contact">Contact</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </>
    )
}
