import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Play, Code2 } from "lucide-react"
import type { BlogPost, Project, Skill, Video } from "@/types"

function Heading({ label, title, description, href, action }: { label: string; title: string; description: string; href: string; action: string }) {
    return <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
        <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2><p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p></div>
        <Link href={href} className="group inline-flex shrink-0 items-center gap-3 self-start border-b border-border pb-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary sm:self-auto">{action}<ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></Link>
    </div>
}

function Cover({ src, alt, sizes = "(min-width: 768px) 50vw, 100vw" }: { src?: string | null; alt: string; sizes?: string }) {
    return src ? <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <div className="flex h-full items-center justify-center bg-muted text-muted-foreground"><Code2 className="h-10 w-10" /></div>
}

function PostDate({ post }: { post: BlogPost }) {
    const date = new Date(post.publishedAt || post.createdAt)
    return <time dateTime={date.toISOString()}>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(date)}</time>
}

export default function HomeContent({ posts, projects, videos, skills }: { posts: BlogPost[]; projects: Project[]; videos: Video[]; skills: Skill[] }) {
    const lead = posts[0]
    return <div id="content" className="scroll-mt-20 bg-background text-foreground">
        <nav aria-label="Explore this page" className="border-b border-border">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-7 gap-y-3 px-6 py-5 text-xs sm:px-8">
                <span className="mr-auto font-semibold uppercase tracking-[0.18em] text-muted-foreground">Explore the portfolio</span>
                {[["Articles", lead ? "#home-articles" : "/blog"], ["Projects", "#home-projects"], ["Videos", videos.length ? "#home-videos" : "/videos"], ["Skills", "#home-skills"]].map(([label, href]) => <Link key={label} href={href} className="inline-flex items-center gap-1.5 py-1 transition-colors hover:text-primary">{label}<ArrowUpRight className="h-3 w-3" /></Link>)}
            </div>
        </nav>

        {lead && <section id="home-articles" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 sm:px-8 lg:py-24">
            <Heading label="01 / The journal" title="Ideas worth sharing." description="Notes, practical guides, and discoveries from working with technology." href="/blog" action="All articles" />
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                <Link href={`/blog/${lead.slug}`} className="group min-w-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                    <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-muted"><Cover src={lead.coverImage} alt={lead.title} /><span className="absolute bottom-4 left-4 rounded-full bg-background px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-foreground">Featured read</span></div>
                    <div className="mt-5 flex items-center gap-3 text-xs text-muted-foreground"><PostDate post={lead} />{lead.tags[0] && <><span aria-hidden="true">/</span><span className="truncate">{lead.tags[0]}</span></>}</div>
                    <h3 className="mt-3 text-xl font-semibold leading-relaxed tracking-tight transition-colors group-hover:text-primary sm:text-2xl">{lead.title}</h3>
                    {lead.excerpt && <p className="mt-3 line-clamp-2 text-sm leading-7 text-muted-foreground">{lead.excerpt}</p>}
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium">Read story<ArrowRight className="h-4 w-4" /></span>
                </Link>
                <div className="divide-y divide-border border-t border-border">
                    {posts.slice(1).map((post, index) => <Link key={post.id} href={`/blog/${post.slug}`} className="group flex items-start gap-4 py-6 first:pt-6 sm:gap-5">
                        <span className="pt-1 font-mono text-xs text-muted-foreground">0{index + 2}</span>
                        <div className="min-w-0 flex-1"><div className="mb-2 text-xs text-muted-foreground"><PostDate post={post} /></div><h3 className="line-clamp-3 text-base font-semibold leading-relaxed transition-colors group-hover:text-primary sm:text-lg">{post.title}</h3>{post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>}</div>
                        <div className="relative hidden h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:block"><Cover src={post.coverImage} alt="" sizes="112px" /></div>
                    </Link>)}
                </div>
            </div>
        </section>}

        <section id="home-projects" className="scroll-mt-20 border-y border-border bg-muted/25">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-24">
                <Heading label="02 / Selected work" title="From idea to something real." description="A closer look at the applications, experiments, and tools I’ve built." href="/projects" action="All projects" />
                {projects.length ? <div className="grid gap-x-8 gap-y-10 md:grid-cols-2">{projects.map((project, index) => <article key={project.id} className="min-w-0">
                    <Link href={`/projects/${project.id}`} className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                        <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-card"><Cover src={project.imageUrl || project.images?.[0]} alt={project.title} /><span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground"><ArrowUpRight className="h-5 w-5" /></span></div>
                        <div className="mt-5 flex items-start gap-4"><span className="mt-1 font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><div className="min-w-0"><h3 className="line-clamp-2 text-xl font-semibold leading-relaxed tracking-tight transition-colors group-hover:text-primary">{project.title}</h3><p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">{project.shortDescription || project.description}</p></div></div>
                    </Link>
                    <div className="ml-8 mt-4 flex flex-wrap gap-2">{project.technologies?.slice(0, 4).map(tech => <span key={tech} className="rounded-full border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground">{tech}</span>)}</div>
                </article>)}</div> : <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">New projects are on the way. Check back soon.</p>}
            </div>
        </section>

        {videos.length > 0 && <section id="home-videos" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-16 sm:px-8 lg:py-24">
            <Heading label="03 / Watch & learn" title="See it in action." description="Walkthroughs and tutorials to help you take the next step." href="/videos" action="All videos" />
            <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{videos.map(video => <Link key={video.id} href={`/videos/${video.id}`} className="group min-w-0">
                <div className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted"><Cover src={video.thumbnailUrl} alt={video.title} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" /><span className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-background text-foreground"><Play className="h-3.5 w-3.5 fill-current" /></span>{video.duration && <span className="absolute bottom-3 right-3 rounded bg-black/80 px-2 py-1 text-[10px] text-white">{video.duration}</span>}</div>
                <h3 className="mt-4 line-clamp-3 text-sm font-semibold leading-7 transition-colors group-hover:text-primary">{video.title}</h3>
            </Link>)}</div>
        </section>}

        <section id="home-skills" className="scroll-mt-20 border-t border-border">
            <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[1fr_1.5fr] lg:gap-20 lg:py-24">
                <div><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">04 / The toolkit</p><h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tools behind the work.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">The technologies I use to explore ideas and bring projects to life.</p><Link href="/skills" className="mt-6 inline-flex items-center gap-3 text-sm font-medium hover:text-primary">Explore all skills<ArrowUpRight className="h-4 w-4" /></Link></div>
                <div className="grid content-start gap-x-8 sm:grid-cols-2">{skills.length ? skills.map(skill => <div key={skill.id} className="flex items-center gap-3 border-b border-border py-5"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">{skill.icon ? <Image src={skill.icon} alt="" width={24} height={24} className="object-contain" /> : <Code2 className="h-5 w-5 text-primary" />}</div><div className="min-w-0"><h3 className="truncate text-sm font-semibold">{skill.name}</h3><p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{skill.category || "Technology"}</p></div></div>) : <p className="text-sm text-muted-foreground">The toolkit is being updated.</p>}</div>
            </div>
        </section>

        <section className="px-6 pb-16 sm:px-8 lg:pb-24"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-3xl border border-border bg-muted/40 p-8 sm:p-12 lg:flex-row lg:items-end lg:p-16"><div><p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Let’s connect</p><h2 className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">Have an idea in mind?<br /><span className="text-muted-foreground">Let’s talk about it.</span></h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">Projects, collaborations, or just a conversation. I’d love to hear from you.</p></div><Link href="/contact" className="inline-flex items-center justify-center gap-6 self-start rounded-full bg-primary px-7 py-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-85 lg:shrink-0">Start a conversation<ArrowUpRight className="h-5 w-5" /></Link></div></section>
    </div>
}

