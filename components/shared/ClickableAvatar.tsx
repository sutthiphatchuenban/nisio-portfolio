"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Maximize2 } from "lucide-react"
import { Lightbox } from "@/components/ui/lightbox"

interface ClickableAvatarProps {
    src: string
    alt: string
    fallbackText: string
}

export function ClickableAvatar({ src, alt, fallbackText }: ClickableAvatarProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    const hasSrc = src && src.length > 0

    // Only set mounted after hydration is complete
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleClick = () => {
        if (hasSrc) {
            setIsLightboxOpen(true)
        }
    }

    return (
        <>
            <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 mb-3 sm:mb-4 rounded-full overflow-hidden bg-muted border-4 border-background shadow-lg cursor-pointer group"
                onClick={handleClick}
            >
                {hasSrc ? (
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes="(max-width: 640px) 96px, 128px"
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority
                        unoptimized={true}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl sm:text-4xl font-bold text-muted-foreground">
                        {fallbackText}
                    </div>
                )}

                {/* Hover overlay with zoom icon */}
                {hasSrc && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <div className="h-8 w-8 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full flex items-center justify-center">
                            <Maximize2 className="h-4 w-4" />
                        </div>
                    </div>
                )}
            </div>

            {/* Lightbox rendered via Portal after mount to avoid hydration mismatch */}
            {mounted && hasSrc && isLightboxOpen && createPortal(
                <Lightbox
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    images={[src]}
                    currentIndex={0}
                    onIndexChange={() => { }}
                    title={alt}
                />,
                document.body
            )}
        </>
    )
}
