"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Code2, MapPin } from "lucide-react"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

export default function Hero() {
    const { settings } = useSiteSettings()
    const heroImage = settings?.heroImage || "/hero_bg.jpg"
    const name = settings?.name || "Sutthiphat Chuenban"
    const title = settings?.title || "Full Stack Developer"
    const location = settings?.location || "Bangkok, Thailand"
    const summary = settings?.bio
        ? settings.bio.replace(/[#*_`>\[\]()]/g, "").slice(0, 180)
        : "I design and build fast, polished web experiences where interface, systems, and motion work together with intent."

    return (
        <section className="relative isolate min-h-[75svh] overflow-hidden bg-background">
            <div className="absolute inset-0 -z-20">
                <Image
                    src={heroImage}
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover opacity-20 saturate-75"
                    unoptimized={true}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/55" />
                <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
            </div>

            <div className="absolute inset-0 -z-10 opacity-[0.08]">
                <div
                    className="h-full w-full"
                    style={{
                        backgroundImage:
                            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
                        backgroundSize: "56px 56px",
                    }}
                />
            </div>

            <div className="container grid min-h-[75svh] items-center gap-10 py-4 md:grid-cols-[1.05fr_0.95fr] md:py-6 lg:gap-14">
                <div className="max-w-3xl space-y-6">

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground md:text-base">
                            {name} - {title}
                        </p>
                        <h1 className="max-w-[12ch] text-5xl font-black leading-[0.86] text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
                            Digital work with taste and velocity
                        </h1>
                    </div>

                    <div className="grid gap-5 border-l border-primary/50 pl-5 md:max-w-2xl md:grid-cols-[1fr_auto] md:items-end">
                        <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                            {summary}
                        </p>
                        <div className="flex flex-wrap gap-3 md:flex-col md:items-start">
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4 text-primary" />
                                {location}
                            </span>
                            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                                <Code2 className="h-4 w-4 text-primary" />
                                Next.js / TypeScript / Prisma
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild size="lg" className="h-12 rounded-none px-6 text-sm uppercase tracking-[0.16em]">
                            <Link href="/projects">
                                View Projects
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-12 rounded-none border-border/80 bg-background/60 px-6 text-sm uppercase tracking-[0.16em] backdrop-blur">
                            <Link href="/contact">Start a Conversation</Link>
                        </Button>
                    </div>

                    <div className="mt-8 border-t border-border/60 pt-6 max-w-md">
                        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Current Focus</p>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Clean architecture, vivid UI, and admin tools that feel quick in real use.
                        </p>
                    </div>
                </div>

                <div className="relative min-h-[350px] md:min-h-[500px]">
                    <div className="absolute left-4 top-4 h-[78%] w-[74%] border border-primary/45" />
                    <div className="absolute bottom-8 right-0 h-[78%] w-[78%] overflow-hidden border border-border bg-muted shadow-2xl">
                        <Image
                            src={heroImage}
                            alt={`${name} portfolio visual`}
                            fill
                            priority
                            sizes="(max-width: 768px) 88vw, 42vw"
                            className="object-cover"
                            unoptimized={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/80" />
                        <div className="absolute left-4 top-4 border border-white/20 bg-black/30 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-white backdrop-blur">
                            Selected Work
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-3 border-t border-white/15 bg-black/35 text-white backdrop-blur-md">
                            {[
                                ["01", "Systems"],
                                ["02", "Interface"],
                                ["03", "Story"],
                            ].map(([value, label]) => (
                                <div key={value} className="border-r border-white/15 p-4 last:border-r-0">
                                    <div className="text-2xl font-black leading-none">{value}</div>
                                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/70">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 hidden -translate-x-1/2 md:block">
                <Link href="#content" className="pointer-events-auto flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground">
                    Scroll
                    <ChevronDown className="h-4 w-4 animate-bounce" />
                </Link>
            </div>
        </section>
    )
}
