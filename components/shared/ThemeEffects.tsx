"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useMemo, useRef, useCallback } from "react"
import { Volume2, VolumeX } from "lucide-react"

// Snowflake characters for variety
const snowflakes = ["❄", "❅", "❆", "✦", "✧"]

// Pre-generated random values that look natural
const PRESET_RANDOMS = [
    0.23, 0.87, 0.45, 0.12, 0.68, 0.91, 0.34, 0.56, 0.78, 0.09,
    0.62, 0.41, 0.95, 0.17, 0.53, 0.29, 0.84, 0.06, 0.73, 0.38,
    0.15, 0.67, 0.82, 0.44, 0.21, 0.58, 0.93, 0.36, 0.11, 0.75,
    0.48, 0.02, 0.69, 0.27, 0.55, 0.88, 0.14, 0.61, 0.33, 0.97,
    0.42, 0.19, 0.76, 0.05, 0.63, 0.31, 0.89, 0.24, 0.57, 0.08,
] as const

function getRandom(seed: number): number {
    return PRESET_RANDOMS[seed % PRESET_RANDOMS.length]
}

// Note frequencies for Christmas melody
const NOTES: Record<string, number> = {
    E4: 329.63, G4: 392.00, C4: 261.63, D4: 293.66,
    F4: 349.23, A4: 440.00, B4: 493.88, C5: 523.25,
    D5: 587.33, E5: 659.25, G5: 783.99, REST: 0
}

// Jingle Bells melody: note and duration (in seconds)
const JINGLE_BELLS = [
    ['E4', 0.25], ['E4', 0.25], ['E4', 0.5],
    ['E4', 0.25], ['E4', 0.25], ['E4', 0.5],
    ['E4', 0.25], ['G4', 0.25], ['C4', 0.25], ['D4', 0.25], ['E4', 1],
    ['F4', 0.25], ['F4', 0.25], ['F4', 0.25], ['F4', 0.25],
    ['F4', 0.25], ['E4', 0.25], ['E4', 0.25], ['E4', 0.25],
    ['E4', 0.25], ['D4', 0.25], ['D4', 0.25], ['E4', 0.25], ['D4', 0.5], ['G4', 0.5],
] as const

interface SnowflakeData {
    char: string
    left: number
    delay: number
    duration: number
    size: number
    opacity: number
}

interface PetalData {
    left: number
    delay: number
    duration: number
}

// Christmas Music Player Component
function ChristmasMusicPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.5)
    const [showVolume, setShowVolume] = useState(false)
    const audioContextRef = useRef<AudioContext | null>(null)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const currentNoteRef = useRef(0)
    const volumeRef = useRef(0.5)

    // Keep volume ref in sync
    useEffect(() => {
        volumeRef.current = volume
    }, [volume])

    const playNote = useCallback((frequency: number, duration: number) => {
        if (!audioContextRef.current) return

        const oscillator = audioContextRef.current.createOscillator()
        const gainNode = audioContextRef.current.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContextRef.current.destination)

        oscillator.type = 'sine'
        oscillator.frequency.value = frequency

        // Envelope for smoother sound with volume control
        const now = audioContextRef.current.currentTime
        const maxGain = volumeRef.current * 1.5
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(maxGain, now + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.05)

        oscillator.start(now)
        oscillator.stop(now + duration)
    }, [])

    const playMelody = useCallback(() => {
        if (!isPlaying) return

        const [note, duration] = JINGLE_BELLS[currentNoteRef.current]
        const frequency = NOTES[note] || 0

        if (frequency > 0) {
            playNote(frequency, duration)
        }

        currentNoteRef.current = (currentNoteRef.current + 1) % JINGLE_BELLS.length

        timeoutRef.current = setTimeout(playMelody, duration * 1000)
    }, [isPlaying, playNote])

    const toggleMusic = useCallback(() => {
        if (!isPlaying) {
            // Start playing
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
            }
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume()
            }
            currentNoteRef.current = 0
            setIsPlaying(true)
        } else {
            // Stop playing
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            setIsPlaying(false)
        }
    }, [isPlaying])

    useEffect(() => {
        if (isPlaying) {
            playMelody()
        } else {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [isPlaying, playMelody])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    return (
        <div
            className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2"
            onMouseEnter={() => setShowVolume(true)}
            onMouseLeave={() => setShowVolume(false)}
        >
            {/* Volume Slider */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-black/80 backdrop-blur-sm
                            transition-all duration-300 ${showVolume ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <VolumeX className="w-4 h-4 text-white/70" />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer
                               accent-red-500 hover:accent-red-400"
                />
                <Volume2 className="w-4 h-4 text-white/70" />
                <span className="text-xs text-white/70 w-8 text-right">{Math.round(volume * 100)}%</span>
            </div>

            {/* Play/Pause Button */}
            <button
                onClick={toggleMusic}
                className="flex items-center gap-2 px-4 py-3 rounded-full
                           bg-gradient-to-r from-red-600 to-green-600 text-white
                           shadow-lg hover:shadow-xl hover:scale-105
                           transition-all duration-300 border-2 border-white/30"
                title={isPlaying ? "Pause Christmas Music" : "Play Christmas Music"}
            >
                {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span className="font-medium text-sm">{isPlaying ? "Playing..." : "Jingle Bells"}</span>
            </button>
        </div>
    )
}

export function ThemeEffects() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Pre-calculate snowflake data
    const snowflakeData: SnowflakeData[] = useMemo(() => {
        return [...Array(25)].map((_, i) => ({
            char: snowflakes[i % snowflakes.length],
            left: getRandom(i) * 100,
            delay: getRandom(i + 10) * 10,
            duration: 8 + getRandom(i + 20) * 6,
            size: 0.8 + getRandom(i + 30) * 0.8,
            opacity: 0.6 + getRandom(i + 40) * 0.4,
        }))
    }, [])

    // Pre-calculate petal data
    const petalData: PetalData[] = useMemo(() => {
        return [...Array(15)].map((_, i) => ({
            left: getRandom(i + 50) * 100,
            delay: getRandom(i + 60) * 8,
            duration: 6 + getRandom(i + 70) * 4,
        }))
    }, [])

    if (!mounted) return null

    return (
        <>
            {/* Cyberpunk Scanlines */}
            {theme === "cyberpunk" && <div className="scanlines" />}

            {/* Sakura Falling Petals */}
            {theme === "sakura" && (
                <div className="sakura-container fixed inset-0 pointer-events-none z-[9998]">
                    {petalData.map((petal, i) => (
                        <div
                            key={i}
                            className="petal"
                            style={{
                                left: `${petal.left}vw`,
                                animationDelay: `${petal.delay}s`,
                                animationDuration: `${petal.duration}s`,
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Christmas Falling Snow + Music */}
            {theme === "christmas" && (
                <>
                    <div className="fixed inset-0 pointer-events-none z-[9998]">
                        {snowflakeData.map((flake, i) => (
                            <div
                                key={i}
                                className="snowflake"
                                style={{
                                    left: `${flake.left}vw`,
                                    animationDelay: `${flake.delay}s`,
                                    animationDuration: `${flake.duration}s`,
                                    fontSize: `${flake.size}rem`,
                                    opacity: flake.opacity,
                                }}
                            >
                                {flake.char}
                            </div>
                        ))}
                    </div>
                    <ChristmasMusicPlayer />
                </>
            )}
        </>
    )
}
