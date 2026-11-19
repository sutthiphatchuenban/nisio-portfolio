"use client"

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import Image from "next/image"
import styles from "./ChristmasIntro.module.css"

const SEEN_KEY = "portfolio-christmas-intro-seen-v2"
const INTRO_DURATION = 7200
const LOAD_TIMEOUT = 2800
let seenInMemory = false

const scenes = [
    { image: "snowy-forest.webp", style: styles.forest },
    { image: "village-street.webp", style: styles.village },
    { image: "christmas-square.webp", style: styles.square },
] as const

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

export default function ChristmasIntro({ onClose }: { onClose: () => void }) {
    const dialogRef = useRef<HTMLDialogElement>(null)
    const [playing, setPlaying] = useState(false)

    useLayoutEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        dialog.showModal()
        let cancelled = false
        const timeout = window.setTimeout(onClose, LOAD_TIMEOUT)
        Promise.all(Array.from(dialog.querySelectorAll("img"), image => image.decode()))
            .then(() => {
                if (cancelled) return
                window.clearTimeout(timeout)
                setPlaying(true)
            })
            .catch(() => {
                if (!cancelled) onClose()
            })

        return () => {
            cancelled = true
            window.clearTimeout(timeout)
            dialog.close()
        }
    }, [onClose])

    useLayoutEffect(() => {
        if (!playing) return
        const timeout = window.setTimeout(onClose, INTRO_DURATION)
        return () => window.clearTimeout(timeout)
    }, [onClose, playing])

    return (
        <dialog
            ref={dialogRef}
            className={styles.dialog}
            data-playing={playing}
            style={{ "--intro-duration": `${INTRO_DURATION}ms` } as CSSProperties}
            aria-labelledby="christmas-intro-title"
            onCancel={event => {
                event.preventDefault()
                onClose()
            }}
        >
            <div className={styles.scenes} aria-hidden="true">
                {scenes.map(({ image, style }, index) => (
                    <div className={`${styles.shot} ${style}`} key={image}>
                        <Image
                            src={`/christmas-intro/${image}`}
                            alt=""
                            fill
                            unoptimized
                            loading="eager"
                            fetchPriority={index === 0 ? "high" : "auto"}
                        />
                    </div>
                ))}
                <div className={styles.bloom} />
            </div>
            <div className={styles.snow} aria-hidden="true">
                {Array.from({ length: 45 }, (_, index) => (
                    <span key={index} style={{
                        left: `${(index * 37.9 + 5) % 100}%`,
                        "--fall-time": `${3 + index % 7}s`,
                        "--fall-delay": `${-(index * 1.57 % 9)}s`,
                        "--flake-size": `${2 + index % 5}px`,
                        "--flake-blur": `${index % 3}px`,
                    } as CSSProperties} />
                ))}
            </div>
            <div className={styles.greeting}>
                <h2 id="christmas-intro-title" lang="en">Merry Christmas</h2>
                <p>ขอให้คริสต์มาสนี้อบอุ่นและเต็มไปด้วยรอยยิ้ม</p>
            </div>
            <div className={styles.progress} aria-hidden="true" />
            <button type="button" className={styles.skip} onClick={onClose}>
                ข้ามอินโทร <span aria-hidden="true">→</span>
            </button>
        </dialog>
    )
}
