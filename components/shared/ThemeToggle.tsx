"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from "@/components/ui/dropdown-menu"
import { Sun, Moon, Gamepad2, Zap, Flower2, TreePine, Ghost, CalendarDays, Check, ArrowLeft, Sparkles, Heart, Droplets, Leaf, Rainbow, Waves, Stars, Wheat, Lamp } from "lucide-react"
import { BASE_THEMES, FESTIVAL_THEMES, getFestivalForDate } from "@/lib/theme-catalog"
import { useSeasonalTheme } from "@/components/providers/seasonal-theme-provider"

const icons = { light: Sun, dark: Moon, lol: Gamepad2, cyberpunk: Zap, newyear: Sparkles, valentine: Heart, sakura: Flower2, songkran: Droplets, botanical: Leaf, pride: Rainbow, ocean: Waves, starlight: Stars, harvest: Wheat, halloween: Ghost, lantern: Lamp, christmas: TreePine }

export function ThemeToggle() {
    const { theme } = useTheme()
    const { enabled, automatic, chooseTheme, chooseAutomatic } = useSeasonalTheme()
    const [mounted, setMounted] = React.useState(false)
    const [mobile, setMobile] = React.useState(false)
    const [festivalPage, setFestivalPage] = React.useState(false)
    React.useEffect(() => {
        setMounted(true)
        const media = window.matchMedia("(max-width: 639px)")
        const sync = () => setMobile(media.matches)
        sync(); media.addEventListener("change", sync)
        return () => media.removeEventListener("change", sync)
    }, [])
    if (!mounted) return <Button variant="ghost" size="icon" disabled aria-label="Toggle theme"><Sun className="h-5 w-5" /></Button>
    const CurrentIcon = automatic ? CalendarDays : icons[theme as keyof typeof icons] || Sun
    const currentSeason = getFestivalForDate()
    const festivals = FESTIVAL_THEMES.map(t => {
        const Icon = icons[t.id]
        return <DropdownMenuItem key={t.id} onSelect={()=>chooseTheme(t.id)} className="min-h-11 gap-3" aria-current={!automatic && theme === t.id ? "true" : undefined}><Icon className="h-4 w-4"/><span className="flex-1">{t.label}<span className="mt-0.5 block text-[10px] text-muted-foreground">{t.month}</span></span>{!automatic && theme === t.id && <Check className="h-4 w-4 text-primary"/>}</DropdownMenuItem>
    })
    return <DropdownMenu onOpenChange={open=>{if(!open)setFestivalPage(false)}}>
        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Toggle theme"><CurrentIcon className="h-5 w-5" /></Button></DropdownMenuTrigger>
        <DropdownMenuContent align="end" collisionPadding={8} className="w-60 max-w-[calc(100vw-1rem)]">
            {mobile && festivalPage ? <><DropdownMenuItem className="min-h-11" onSelect={e=>{e.preventDefault();setFestivalPage(false)}}><ArrowLeft/>กลับไปเลือกธีมทั่วไป</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuLabel>ธีมเทศกาล · 12 เดือน</DropdownMenuLabel>{festivals}</> : <>
                <DropdownMenuLabel>รูปแบบเว็บไซต์</DropdownMenuLabel>
                {BASE_THEMES.map(t=>{const Icon=icons[t.id];return <DropdownMenuItem key={t.id} onSelect={()=>chooseTheme(t.id)} className="min-h-10"><Icon/>{t.label}{!automatic && theme===t.id && <Check className="ml-auto"/>}</DropdownMenuItem>})}
                <DropdownMenuSeparator/>
                {mobile ? <DropdownMenuItem className="min-h-11" onSelect={e=>{e.preventDefault();setFestivalPage(true)}}><CalendarDays/>ธีมเทศกาล<span className="ml-auto text-xs text-muted-foreground">12 เดือน →</span></DropdownMenuItem> : <DropdownMenuSub><DropdownMenuSubTrigger className="min-h-11"><CalendarDays/>ธีมเทศกาล</DropdownMenuSubTrigger><DropdownMenuPortal><DropdownMenuSubContent collisionPadding={8} className="max-h-[min(75dvh,32rem)] w-64 overflow-y-auto"><DropdownMenuLabel>เลือกได้ทุกช่วงเวลา</DropdownMenuLabel>{festivals}</DropdownMenuSubContent></DropdownMenuPortal></DropdownMenuSub>}
                <DropdownMenuSeparator/>
                <DropdownMenuItem disabled={!enabled} onSelect={chooseAutomatic} className="min-h-12"><CalendarDays/><span className="flex-1">ตามเทศกาลอัตโนมัติ<span className="mt-1 block text-[10px] text-muted-foreground">{enabled?`${currentSeason.month} · ${currentSeason.label}`:"เว็บไซต์ยังไม่เปิดโหมดอัตโนมัติ"}</span></span>{automatic && <Check/>}</DropdownMenuItem>
            </>}
        </DropdownMenuContent>
    </DropdownMenu>
}
