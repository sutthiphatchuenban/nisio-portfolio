"use client"

import { useState, type CSSProperties } from "react"
import { Flower2, Wind } from "lucide-react"

function Blossom({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
    return <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {[0,72,144,216,288].map(angle=><path key={angle} transform={`rotate(${angle})`} d="M0 1C-9-3-10-12-4-16L0-13 4-16C10-12 9-3 0 1Z" fill="#f6c8d2" stroke="#d99daa" strokeWidth=".5" />)}
        <circle r="2.8" fill="#b56b77" />
        {[0,72,144,216,288].map(angle=><circle key={angle} transform={`rotate(${angle})`} cy="-5" r=".7" fill="#bd934f" />)}
    </g>
}

export function SakuraBranches() {
    return <div className="sakura-branches" aria-hidden="true">
        <svg className="sakura-branch sakura-branch-left" viewBox="0 0 260 150" fill="none"><path d="M-12 3C55 4 94 51 158 75S211 96 249 130" stroke="#795d53" strokeWidth="3" strokeLinecap="round"/><path d="M44 22 71 8M93 50 111 22M130 65 139 36M156 74 178 47M182 88 177 119M219 108 242 92M68 34 52 68" stroke="#99776b" strokeWidth="1.8" strokeLinecap="round"/>
            {[[70,10,.65],[110,23,.8],[139,38,.65],[178,47,.8],[156,75,1],[178,119,.7],[241,92,.7],[218,108,.8],[51,68,.75],[94,49,1],[28,13,.8]].map(([x,y,scale],i)=><Blossom key={i} x={x} y={y} scale={scale}/>)}
            <path d="M124 63q-21-4-23 9 16 6 23-9M198 97q19-5 21 7-13 7-21-7" fill="#80967b" opacity=".8" />
        </svg>
        <svg className="sakura-branch sakura-branch-right" viewBox="0 0 260 150" fill="none"><path d="M-12 3C55 4 94 51 158 75S211 96 249 130" stroke="#795d53" strokeWidth="3" strokeLinecap="round"/><path d="M44 22 71 8M93 50 111 22M130 65 139 36M156 74 178 47M182 88 177 119M219 108 242 92" stroke="#99776b" strokeWidth="1.8" strokeLinecap="round"/>{[[70,10,.7],[110,23,.8],[178,47,.9],[156,75,1],[178,119,.6],[241,92,.7],[218,108,.8],[94,49,.7],[28,13,.8]].map(([x,y,scale],i)=><Blossom key={i} x={x} y={y} scale={scale}/>)}<path d="M124 63q-21-4-23 9 16 6 23-9" fill="#80967b" opacity=".8"/></svg>
    </div>
}

export default function SakuraEffects() {
    const [petals, setPetals] = useState(true)
    return <>
        <div className="sakura-atmosphere" aria-hidden="true" />
        <div className="sakura-petals" aria-hidden="true" hidden={!petals}>
            {Array.from({length:28},(_,i)=><span key={i} className="sakura-petal-track" style={{left:`${(i*33.7+7)%100}%`, '--petal-duration':`${17+i%8*2}s`, '--petal-delay':`${-(i*7.1%34)}s`, '--petal-size':`${7+i%4*2}px`, '--petal-drift':`${(i%2===0?1:-1)*(35+i%5*15)}px`, '--petal-turn':`${i%2===0?320:-280}deg`} as CSSProperties}><span className="sakura-petal" /></span>)}
        </div>
        <button type="button" className="sakura-breeze" onClick={()=>setPetals(v=>!v)} aria-label={petals?'ปิดกลีบซากุระ':'เปิดกลีบซากุระ'} aria-pressed={petals}><Flower2 className="h-4 w-4" /><span className="text-xs">Sakura breeze</span><Wind className={`h-3.5 w-3.5 ${petals?'opacity-75':'opacity-30'}`} /></button>
    </>
}
