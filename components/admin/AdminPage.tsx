"use client"

import { Search, X, type LucideIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function AdminPageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
    return <div className="flex flex-wrap items-start justify-between gap-5 pb-1">
        <div className="min-w-0"><p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Workspace / {eyebrow}</p><h1 className="text-3xl font-semibold tracking-tight">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div>
        {children && <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">{children}</div>}
    </div>
}

export function AdminSearch({ value, onChange, placeholder = "ค้นหา…" }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
    return <div className="relative min-w-0 w-full sm:max-w-sm"><Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><Input aria-label={placeholder} placeholder={placeholder} value={value} onChange={event => onChange(event.target.value)} className="h-11 bg-background pl-10 pr-10 text-base sm:text-sm" />{value && <Button type="button" variant="ghost" size="icon" aria-label="ล้างการค้นหา" onClick={() => onChange("")} className="absolute right-0 top-0 h-11 w-10"><X className="h-4 w-4" /></Button>}</div>
}

export function AdminFilter({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: { value: string; label: string; count?: number }[] }) {
    return <div className="flex max-w-full flex-wrap gap-1 rounded-lg bg-muted/60 p-1" aria-label="กรองรายการ">{options.map(option => <button key={option.value} type="button" aria-pressed={value === option.value} onClick={() => onChange(option.value)} className={`flex min-h-9 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${value === option.value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{option.label}{option.count !== undefined && <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] tabular-nums">{option.count}</span>}</button>)}</div>
}

export function AdminEmpty({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
    return <div className="flex flex-col items-center justify-center px-5 py-14 text-center"><div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border bg-muted/40"><Icon className="h-5 w-5 text-muted-foreground" /></div><p className="font-medium">{title}</p><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p></div>
}

export function AdminSummary({ items }: { items: { label: string; value: number | string; icon: LucideIcon }[] }) {
    return <div className="grid grid-cols-3 gap-2 sm:gap-3">{items.map(item => <div key={item.label} className="flex min-w-0 flex-col items-center gap-3 rounded-2xl border bg-card px-2 py-4 text-center sm:flex-row sm:px-5 sm:text-left"><div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary sm:flex"><item.icon className="h-4 w-4" /></div><div className="min-w-0"><p className="text-xl font-semibold tabular-nums tracking-tight sm:text-2xl">{item.value}</p><p className="mt-1 text-[10px] leading-5 text-muted-foreground sm:text-xs">{item.label}</p></div></div>)}</div>
}
