"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2, LockKeyhole, LayoutDashboard, FileText, Settings2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { useSiteSettings } from "@/components/providers/site-settings-provider"

const formSchema = z.object({
    email: z.string().trim().email("กรุณากรอกอีเมลที่ถูกต้อง"),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
})

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams?.get("callbackUrl") || "/admin/dashboard"
    const { settings } = useSiteSettings()
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email: "", password: "" } })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        setError(null)
        try {
            const result = await signIn("credentials", { redirect: false, email: values.email.trim(), password: values.password.trim() })
            if (!result || result.error || !result.ok) {
                setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองอีกครั้ง")
                return
            }
            toast.success("เข้าสู่ระบบสำเร็จ")
            router.push(callbackUrl)
            router.refresh()
        } catch {
            setError("ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองอีกครั้ง")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-svh flex-col bg-background text-foreground">
            <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 sm:px-10">
                <Link href="/" className="inline-flex items-center gap-3 text-sm font-bold tracking-tight"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><LayoutDashboard className="h-4 w-4" /></span>{settings?.siteName || "PORTX"}<span className="hidden border-l border-border pl-3 text-xs font-normal text-muted-foreground sm:inline">Admin workspace</span></Link>
                <div className="flex items-center gap-3"><Link href="/" className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" />กลับเว็บไซต์</Link><ThemeToggle /></div>
            </header>

            <main className="grid flex-1 lg:grid-cols-2">
                <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-muted/30 p-12 lg:flex xl:p-20">
                    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)", backgroundSize: "56px 56px" }} />
                    <p className="relative text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">Your portfolio, behind the scenes.</p>
                    <div className="relative my-16 max-w-md"><div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-background text-primary"><LayoutDashboard className="h-6 w-6" /></div><h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">พื้นที่จัดการ<br /><span className="text-muted-foreground">ทุกเรื่องราวของคุณ</span></h1><p className="mt-6 max-w-sm text-sm leading-8 text-muted-foreground">ดูแลผลงาน แบ่งปันความรู้ และอัปเดตเว็บไซต์<br />ให้เป็นตัวคุณในทุกวัน</p>
                        <div className="mt-10 space-y-4 border-t border-border pt-7">{[{ icon: FileText, text: "ผลงาน บทความ และวิดีโอ" }, { icon: LayoutDashboard, text: "สถิติผู้เข้าชมและข้อความติดต่อ" }, { icon: Settings2, text: "ข้อมูลส่วนตัวและการตั้งค่าเว็บไซต์" }].map(({ icon: Icon, text }) => <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground"><Icon className="h-4 w-4 shrink-0 text-primary" />{text}</div>)}</div>
                    </div>
                    <p className="relative text-xs text-muted-foreground">สร้างสรรค์ อัปเดต และเติบโตไปด้วยกัน</p>
                </aside>

                <section aria-labelledby="login-title" className="flex items-center justify-center px-6 py-14 sm:px-10 lg:py-20">
                    <div className="w-full max-w-sm">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground"><LockKeyhole className="h-3 w-3" />Administrator access</div>
                        <h2 id="login-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">ยินดีต้อนรับกลับ</h2>
                        <p className="mb-9 mt-4 text-sm leading-7 text-muted-foreground">เข้าสู่ระบบเพื่อจัดการเนื้อหาและดูแลเว็บไซต์ของคุณ</p>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6" aria-busy={loading}>
                                <FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>อีเมล</FormLabel><FormControl><Input type="email" autoComplete="username" inputMode="email" placeholder="you@example.com" className="h-12 bg-background px-4" disabled={loading} {...field} /></FormControl><FormMessage /></FormItem>} />
                                <FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel>รหัสผ่าน</FormLabel><div className="relative"><FormControl><Input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="กรอกรหัสผ่านของคุณ" className="h-12 bg-background pl-4 pr-12" disabled={loading} {...field} /></FormControl><button type="button" aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)} disabled={loading} className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-50">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><FormMessage /></FormItem>} />
                                {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm leading-6 text-destructive">{error}</p>}
                                <Button type="submit" className="h-12 w-full gap-3 text-sm font-semibold" disabled={loading}>{loading ? <><Loader2 className="h-4 w-4 animate-spin" />กำลังเข้าสู่ระบบ...</> : <>เข้าสู่ระบบ<ArrowRight className="h-4 w-4" /></>}</Button>
                            </form>
                        </Form>
                        <p className="mt-8 border-t border-border pt-6 text-center text-xs leading-6 text-muted-foreground">สำหรับผู้ดูแลเว็บไซต์ที่ได้รับสิทธิ์เท่านั้น</p>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default function LoginPage() {
    return <Suspense fallback={<div className="flex min-h-svh items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="กำลังโหลด" /></div>}><LoginForm /></Suspense>
}
