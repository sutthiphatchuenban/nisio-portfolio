"use client"

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { createChristmasRenderer } from "./christmas-animation"
import { playChristmasSoundtrack } from "./christmas-soundtrack"
import styles from "./ChristmasIntro.module.css"

const SEEN_KEY = "portfolio-christmas-intro-seen-v3"
const INTRO_DURATION = 30_000
let seenInMemory = false

export function shouldAutoPlayChristmasIntro() {
    if (seenInMemory || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false

    try {
        if (sessionStorage.getItem(SEEN_KEY)) return false
        sessionStorage.setItem(SEEN_KEY, "1")
    } catch {
        // The in-memory flag still covers client navigations when storage is unavailable.
    }
    seenInMemory = true
    return true
}

type IntroProps = {
    onClose: () => void
    initialSound: Promise<AudioContext | null> | null
    enableAudio: () => Promise<AudioContext | null>
}

export default function ChristmasIntro({ onClose, initialSound, enableAudio }: IntroProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const timeline = useRef({ startedAt: 0, offset: 0 })
    const [soundRequest, setSoundRequest] = useState(initialSound)
    const [soundActive, setSoundActive] = useState(false)

    useLayoutEffect(() => {
        const dialog = dialogRef.current
        const canvas = canvasRef.current
        if (!dialog || !canvas) return

        const render = createChristmasRenderer(canvas)
        if (!render) {
            onClose()
            return
        }

        dialog.showModal()
        const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
        const still = motionPreference.matches
        const startedAt = performance.now()
        // The reduced-motion view displays the final scene for the final seven seconds.
        timeline.current = { startedAt, offset: still ? 23 : 0 }
        const timeout = window.setTimeout(onClose, still ? 7000 : INTRO_DURATION)
        let frame = 0
        let lastDrawnAt = startedAt
        let observer: ResizeObserver | undefined

        if (still) {
            const drawStill = () => render(29, true)
            drawStill()
            observer = new ResizeObserver(drawStill)
            observer.observe(canvas)
        } else {
            render(0)
            const draw = (now: number) => {
                if (now - lastDrawnAt >= 1000 / 30 - 1) {
                    render(Math.min(now - startedAt, INTRO_DURATION) / 1000)
                    lastDrawnAt = now
                }
                frame = requestAnimationFrame(draw)
            }
            frame = requestAnimationFrame(draw)
        }

        const handleMotionChange = () => onClose()
        motionPreference.addEventListener("change", handleMotionChange)

        return () => {
            window.clearTimeout(timeout)
            cancelAnimationFrame(frame)
            observer?.disconnect()
            motionPreference.removeEventListener("change", handleMotionChange)
            dialog.close()
        }
    }, [onClose])

    useEffect(() => {
        if (!soundRequest) {
            setSoundActive(false)
            return
        }

        let cancelled = false
        let stop: (() => void) | undefined
        void soundRequest.then(audio => {
            if (cancelled || !audio) return
            const { startedAt, offset } = timeline.current
            const elapsed = offset + (performance.now() - startedAt) / 1000
            stop = playChristmasSoundtrack(audio, elapsed)
            setSoundActive(!!stop)
        }).catch(() => {
            if (!cancelled) setSoundActive(false)
        })

        return () => {
            cancelled = true
            stop?.()
        }
    }, [soundRequest])

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            style={{ "--intro-duration": `${INTRO_DURATION}ms` } as CSSProperties}
            aria-labelledby="christmas-intro-title"
            onCancel={event => {
                event.preventDefault()
                onClose()
            }}
        >
            <canvas ref={canvasRef} className={styles.artwork} aria-hidden="true" />
            <div className={styles.greeting}>
                <h2 id="christmas-intro-title" lang="en">Merry Christmas</h2>
                <p>ขอให้ความอบอุ่นเดินทางไปถึงทุกบ้าน</p>
            </div>
            <div className={styles.progress} aria-hidden="true" />
            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.control}
                    onClick={() => setSoundRequest(soundActive ? null : enableAudio())}
                >
                    {soundActive ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
                    {soundActive ? "ปิดเสียง" : "เปิดเสียง"}
                </button>
                <button type="button" className={styles.control} onClick={onClose}>
                    ข้ามอินโทร <span aria-hidden="true">→</span>
                </button>
            </div>
        </dialog>
    )
}
