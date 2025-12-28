"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeEffects() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <>
            {/* Cyberpunk Scanlines */}
            {theme === "cyberpunk" && <div className="scanlines" />}

            {/* Sakura Falling Petals */}
            {theme === "sakura" && (
                <div className="sakura-container fixed inset-0 pointer-events-none z-[9998]">
                    {[...Array(15)].map((_, i) => (
                        <div
                            key={i}
                            className="petal"
                            style={{
                                left: `${Math.random() * 100}vw`,
                                animationDelay: `${Math.random() * 8}s`,
                                animationDuration: `${6 + Math.random() * 4}s`,
                            }}
                        />
                    ))}
                </div>
            )}
        </>
    )
}
