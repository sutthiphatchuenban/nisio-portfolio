"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Music2, Pause, Play, SlidersHorizontal, Snowflake } from "lucide-react"

const melody: [number, number][] = [
    [329.63,.25],[329.63,.25],[329.63,.5],[329.63,.25],[329.63,.25],[329.63,.5],
    [329.63,.25],[392,.25],[261.63,.25],[293.66,.25],[329.63,1],
    [349.23,.25],[349.23,.25],[349.23,.25],[349.23,.25],[349.23,.25],[329.63,.25],[329.63,.25],[329.63,.25],
    [329.63,.25],[293.66,.25],[293.66,.25],[329.63,.25],[293.66,.5],[392,.5],
]

function PineCorner() {
    return <svg viewBox="0 0 180 120" fill="none" aria-hidden="true"><path d="M-10 4 Q70 18 148 83" stroke="#74613a" strokeWidth="2" />{Array.from({length:12},(_,i)=>{const x=i*12,y=5+i*5;return <g key={i} stroke={i%2?'#3d6950':'#28533d'} strokeWidth="1.6" strokeLinecap="round"><path d={`M${x} ${y}l-7 -20 M${x+4} ${y+2}l-1 -24 M${x+8} ${y+4}l4 -22 M${x} ${y}l-21 10 M${x+4} ${y+2}l-18 17 M${x+8} ${y+4}l-10 23`} /></g>})}<path d="M59 20v38" stroke="#dfc38b" strokeWidth=".8"/><circle cx="59" cy="70" r="11" fill="#913f36" stroke="#c58d6c" strokeWidth=".7"/><path d="M54 63q-5 6 0 12" stroke="#d6906e" opacity=".6"/><path d="M116 55v36m-4 4h8l-4 4z" stroke="#dfc38b" strokeWidth=".8"/><path d="m116 89 2.5 5 5.5.8-4 4 .9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-4 5.5-.8z" fill="#d6b474"/></svg>
}

export function ChristmasLights() {
    return <><div className="festive-lights" aria-hidden="true"><svg viewBox="0 0 1440 36" preserveAspectRatio="none"><path d="M0 3 Q120 38 240 3 Q360 38 480 3 Q600 38 720 3 Q840 38 960 3 Q1080 38 1200 3 Q1320 38 1440 3" fill="none" stroke="currentColor" strokeWidth="1" />{Array.from({length:36},(_,i)=><g key={i} className="festive-bulb" style={{animationDelay:`${-(i%7)}s`}}><path d={`M${i*40+20} ${i%6===0||i%6===5?9:18}v5`} stroke="currentColor"/><ellipse cx={i*40+20} cy={i%6===0||i%6===5?17:26} rx="2.5" ry="4" fill={i%9===0?'#b86b57':'#f2d69a'}/></g>)}</svg></div><div className="festive-evergreen festive-evergreen-left"><PineCorner /></div><div className="festive-evergreen festive-evergreen-right"><PineCorner /></div></>
}

export default function ChristmasEffects() {
    const [playing, setPlaying] = useState(false)
    const [volume, setVolume] = useState(.2)
    const [options, setOptions] = useState(false)
    const [snow, setSnow] = useState(true)
    const [audioError, setAudioError] = useState(false)
    const context = useRef<AudioContext | null>(null)
    const master = useRef<GainNode | null>(null)
    const volumeRef = useRef(volume)

    useEffect(() => {
        volumeRef.current = volume
        if(context.current && master.current && playing) master.current.gain.setTargetAtTime(volume * .22, context.current.currentTime, .05)
    }, [volume, playing])

    useEffect(() => {
        const ctx = context.current, gain = master.current
        if (!ctx || !gain) return
        if (!playing) { gain.gain.setTargetAtTime(0, ctx.currentTime, .03); return }
        gain.gain.setTargetAtTime(volumeRef.current * .22, ctx.currentTime, .03)
        let index = 0
        let timer: ReturnType<typeof setTimeout>
        function next() {
            if (!ctx || !gain) return
            const [frequency, duration] = melody[index++ % melody.length]
            const oscillator = ctx.createOscillator(), envelope = ctx.createGain()
            oscillator.type = "sine"
            oscillator.frequency.value = frequency
            oscillator.connect(envelope); envelope.connect(gain)
            const now = ctx.currentTime
            envelope.gain.setValueAtTime(0, now)
            envelope.gain.linearRampToValueAtTime(1, now + .015)
            envelope.gain.exponentialRampToValueAtTime(.001, now + duration * .95)
            oscillator.start(now); oscillator.stop(now + duration)
            oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect() }
            timer = setTimeout(next, duration * 1000)
        }
        next()
        return () => { clearTimeout(timer); gain.gain.setTargetAtTime(0, ctx.currentTime, .03) }
    }, [playing])

    useEffect(() => () => { void context.current?.close() }, [])
    useEffect(() => {
        const pause = () => { if(document.hidden) setPlaying(false) }
        document.addEventListener("visibilitychange", pause)
        return () => document.removeEventListener("visibilitychange", pause)
    }, [])

    async function toggleMusic() {
        if(playing) { setPlaying(false); return }
        try {
            if(!context.current) {
                context.current = new AudioContext()
                master.current = context.current.createGain()
                master.current.gain.value = 0
                master.current.connect(context.current.destination)
            }
            await context.current.resume()
            setAudioError(false); setPlaying(true)
        } catch { setAudioError(true) }
    }

    return <>
        <div className="winter-atmosphere" aria-hidden="true" />
        <div className="winter-snow" aria-hidden="true" hidden={!snow}>
            {Array.from({length:42}, (_,i) => <span key={i} className={`winter-flake ${i%3===0?'winter-flake-near':''}`} style={{left:`${(i*37.7+3)%100}%`, '--fall-duration':`${14+(i%9)*2}s`, '--fall-delay':`${-((i*5.3)%30)}s`, '--flake-size':`${i%3===0?4:1.5+(i%3)}px`, '--flake-opacity':i%3===0?.4:.25} as CSSProperties} />)}
        </div>
        <div className="winter-player">
            {options && <div id="winter-options" className="winter-options"><label htmlFor="winter-volume" className="flex items-center justify-between text-xs"><span>ระดับเสียง</span><span>{Math.round(volume*100)}%</span></label><input id="winter-volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e=>setVolume(Number(e.target.value))} className="mt-3 w-full accent-[#e5c78d]" /><label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-6 border-t border-white/10 pt-3 text-xs"><span className="flex items-center gap-2"><Snowflake className="h-3.5 w-3.5" />แสดงหิมะ</span><input type="checkbox" checked={snow} onChange={e=>setSnow(e.target.checked)} className="h-4 w-4 accent-[#e5c78d]" /></label></div>}
            {audioError && <p role="alert" className="mb-2 max-w-56 text-xs">ไม่สามารถเปิดเสียงได้ กรุณาลองอีกครั้ง</p>}
            <div className="winter-player-bar"><span className="winter-music-mark" aria-hidden="true"><Music2 className="h-4 w-4" /></span><button type="button" onClick={toggleMusic} aria-label={playing?'หยุดเพลงคริสต์มาส':'เปิดเพลงคริสต์มาส'} aria-pressed={playing} className="winter-play"><span className="flex flex-col items-start"><span className="text-[9px] uppercase tracking-[.15em] opacity-60">Winter radio</span><span className="text-xs font-medium">Jingle Bells</span></span>{playing?<Pause className="h-3.5 w-3.5" />:<Play className="h-3.5 w-3.5" />}</button><button type="button" onClick={()=>setOptions(v=>!v)} aria-label="ตั้งค่าเพลงและหิมะ" aria-expanded={options} aria-controls="winter-options" className="winter-settings"><SlidersHorizontal className="h-4 w-4" /></button></div>
        </div>
    </>
}
