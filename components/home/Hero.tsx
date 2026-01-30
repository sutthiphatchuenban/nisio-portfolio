"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

export default function Hero() {
    const { settings } = useSiteSettings()

    return (
        <section className="relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center animate-in fade-in duration-1000"
                style={{
                    backgroundImage: `url('${settings?.heroImage || '/hero_bg.jpg'}')`,
                }}
            ></div>
            <div className="absolute inset-0 bg-black/60 animate-in fade-in duration-700"></div>
            <div className="relative z-10 space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
                <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1
                    className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold hero-gradient glitch-text animate-in slide-in-from-bottom-4 duration-700"
                    data-text="Building Digital Experiences That Matter"
                >
                    Building Digital <br className="hidden sm:inline" />
                    Experiences That Matter
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 animate-in slide-in-from-bottom-4 duration-700 delay-150">
                    Full-stack developer implementing modern web applications with precision and creativity.
                </p>
                <div className="space-x-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                    <Link href="/projects">
                        <Button size="lg" className="rounded-full animate-bounce">View Projects</Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="outline" size="lg" className="rounded-full">Contact Me</Button>
                    </Link>
                </div>
                </div>
            </div>
        </section>
    )
}
