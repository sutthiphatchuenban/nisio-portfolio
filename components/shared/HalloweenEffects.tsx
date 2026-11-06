"use client"

import { useState, type CSSProperties } from "react"
import { Ghost, Sparkles } from "lucide-react"

function Bat({ className }: { className?: string }) {
    return <svg className={className} viewBox="0 0 64 30" fill="currentColor" aria-hidden="true"><path d="M32 12 27 7 28 15C18 11 9 5 1 1c1 11 5 18 13 23 1-5 6-5 9-1 2-4 5-3 9 6 4-9 7-10 9-6 3-4 8-4 9 1C58 19 62 12 63 1c-8 4-17 10-27 14l1-8-5 5Z"/></svg>
}

function Web() {
    return <svg viewBox="0 0 200 150" fill="none" aria-hidden="true"><g stroke="currentColor" strokeWidth=".75"><path d="M0 0 194 16M0 0 178 61M0 0 137 108M0 0 72 144M0 0 10 148"/>{[.25,.5,.75,1].map(k=><path key={k} transform={`scale(${k})`} d="M194 16Q174 30 178 61Q146 65 137 108Q94 108 72 144Q45 126 10 148"/>)}</g></svg>
}

function Pumpkin() {
    return <svg viewBox="0 0 68 76" fill="none" aria-hidden="true"><path d="M34 22q-5-13 6-16" stroke="#899369" strokeWidth="4" strokeLinecap="round"/><ellipse cx="34" cy="46" rx="30" ry="25" fill="#bb632e"/><ellipse cx="34" cy="46" rx="21" ry="25" fill="#dc823b"/><ellipse cx="34" cy="46" rx="10" ry="25" fill="#e99949"/><path d="m15 42 12-7-1 11zm38 0-12-7 1 11zM18 52l9 3 3-4 4 5 4-5 3 4 9-3q-13 20-32 0" fill="#2b1a26"/><path d="m16 42 10-5-1 7zm36 0-10-5 1 7z" fill="#ffd38b" opacity=".75"/></svg>
}

export function HalloweenDecorations() {
    return <div className="halloween-decorations" aria-hidden="true"><div className="halloween-web halloween-web-left"><Web /></div><div className="halloween-web halloween-web-right"><Web /></div><div className="halloween-lantern"><span/><Pumpkin /></div><div className="halloween-moon"/><Bat className="halloween-moon-bat" /></div>
}

export default function HalloweenEffects() {
    const [enabled, setEnabled] = useState(true)
    return <>
        <div className="halloween-atmosphere" aria-hidden="true" />
        <div className="halloween-particles" aria-hidden="true" hidden={!enabled}>{Array.from({length:24},(_,i)=><span className="halloween-ember" key={i} style={{left:`${(i*37.4+8)%100}%`, '--ember-duration':`${22+i%7*3}s`, '--ember-delay':`${-(i*6.7%40)}s`, '--ember-size':`${i%3===0?3:2}px`} as CSSProperties}/>)}{[0,1,2].map(i=><div className="halloween-bat-track" key={i} style={{'--bat-delay':`${-i*13}s`,top:`${15+i*18}%`} as CSSProperties}><Bat /></div>)}</div>
        <button type="button" className="halloween-mood" onClick={()=>setEnabled(v=>!v)} aria-label={enabled?'ปิดเอฟเฟกต์ Halloween':'เปิดเอฟเฟกต์ Halloween'} aria-pressed={enabled}><Ghost className="h-4 w-4"/><span className="text-xs">Midnight mood</span><Sparkles className={`h-3.5 w-3.5 ${enabled?'opacity-80':'opacity-25'}`}/></button>
    </>
}
