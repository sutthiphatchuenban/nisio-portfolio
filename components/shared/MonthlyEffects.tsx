"use client"

import { useState, type CSSProperties } from "react"
import { Sparkles, Heart, Droplets, Leaf, Rainbow, Waves, Stars, Wheat, Lamp, Wind } from "lucide-react"

import { ART_THEMES, SeasonalArtwork } from "@/components/shared/SeasonalArtwork"

export const MONTHLY_MOTIFS = { newyear: Sparkles, valentine: Heart, songkran: Droplets, botanical: Leaf, pride: Rainbow, ocean: Waves, starlight: Stars, harvest: Wheat, lantern: Lamp }
export type MonthlyTheme = keyof typeof MONTHLY_MOTIFS

export function MonthlyDecorations() {
    return <>{ART_THEMES.map(id => <div key={id} data-season={id} className="monthly-decoration" aria-hidden="true"><SeasonalArtwork theme={id} side="left"/><SeasonalArtwork theme={id} side="right"/></div>)}</>
}

export default function MonthlyEffects({ id }: { id: MonthlyTheme }) {
    const [enabled, setEnabled] = useState(true)
    const Icon = MONTHLY_MOTIFS[id]
    return <><div className="monthly-atmosphere" aria-hidden="true"/><div className="monthly-particles" data-season={id} aria-hidden="true" hidden={!enabled}>{Array.from({length:20},(_,i)=><span className="monthly-particle" key={i} style={{left:`${(i*37.6+7)%100}%`, '--season-duration':`${21+i%7*2}s`, '--season-delay':`${-(i*6.3%34)}s`, '--season-size':`${6+i%4*2}px`, '--season-y':`${8+(i*17.3)%80}%`} as CSSProperties}/>)}</div><button type="button" className="monthly-control" onClick={()=>setEnabled(v=>!v)} aria-label={enabled?'ปิดเอฟเฟกต์เทศกาล':'เปิดเอฟเฟกต์เทศกาล'} aria-pressed={enabled}><Icon className="h-4 w-4"/><span className="text-xs">Seasonal atmosphere</span><Wind className={`h-3.5 w-3.5 ${enabled?'opacity-80':'opacity-30'}`}/></button></>
}
