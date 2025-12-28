import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
    return (
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1
                    className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold hero-gradient glitch-text"
                    data-text="Building Digital Experiences That Matter"
                >
                    Building Digital <br className="hidden sm:inline" />
                    Experiences That Matter
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                    Full-stack developer implementing modern web applications with precision and creativity.
                </p>
                <div className="space-x-4">
                    <Link href="/projects">
                        <Button size="lg" className="rounded-full">View Projects</Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="outline" size="lg" className="rounded-full">Contact Me</Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
