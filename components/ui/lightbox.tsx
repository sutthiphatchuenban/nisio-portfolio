"use client"

import { useEffect, useCallback, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface LightboxProps {
    isOpen: boolean
    onClose: () => void
    images: string[]
    currentIndex: number
    onIndexChange: (index: number) => void
    title: string
}

export function Lightbox({
    isOpen,
    onClose,
    images,
    currentIndex,
    onIndexChange,
    title
}: LightboxProps) {
    const [scale, setScale] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Reset state when opening
    useEffect(() => {
        if (isOpen) {
            setScale(1)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [isOpen])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case "Escape":
                onClose()
                break
            case "ArrowLeft":
                goToPrevious()
                break
            case "ArrowRight":
                goToNext()
                break
            case "+":
            case "=":
                setScale((s) => Math.min(s + 0.25, 3))
                break
            case "-":
                setScale((s) => Math.max(s - 0.25, 0.5))
                break
        }
    }, [isOpen, onClose])

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [handleKeyDown])

    const goToPrevious = () => {
        onIndexChange(currentIndex === 0 ? images.length - 1 : currentIndex - 1)
        setScale(1)
    }

    const goToNext = () => {
        onIndexChange(currentIndex === images.length - 1 ? 0 : currentIndex + 1)
        setScale(1)
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    const handleDownload = () => {
        const link = document.createElement("a")
        link.href = images[currentIndex]
        link.download = `${title}-${currentIndex + 1}.jpg`
        link.target = "_blank"
        link.rel = "noreferrer"
        link.click()
    }

    if (!isOpen || images.length === 0) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 text-white">
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                        {title}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
                        className="text-white hover:bg-white/20"
                        title="Zoom out"
                    >
                        <ZoomOut className="h-5 w-5" />
                    </Button>
                    <span className="text-xs text-muted-foreground w-12 text-center">
                        {Math.round(scale * 100)}%
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
                        className="text-white hover:bg-white/20"
                        title="Zoom in"
                    >
                        <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="text-white hover:bg-white/20"
                        title="Toggle fullscreen"
                    >
                        {isFullscreen ? (
                            <span className="text-xs font-bold">⤓</span>
                        ) : (
                            <span className="text-xs font-bold">⤢</span>
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDownload}
                        className="text-white hover:bg-white/20"
                        title="Download image"
                    >
                        <Download className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-white hover:bg-white/20"
                        title="Close (Esc)"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Image Container */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                <div
                    className={cn(
                        "relative transition-transform duration-200 flex items-center justify-center",
                        scale === 1 ? "w-full h-full" : ""
                    )}
                    style={{
                        transform: `scale(${scale})`
                    }}
                >
                    <div className="relative w-[90vw] h-[70vh]">
                        <Image
                            src={images[currentIndex]}
                            alt={`${title} - Image ${currentIndex + 1}`}
                            fill
                            sizes="100vw"
                            className="object-contain"
                            priority
                            unoptimized={true}
                            draggable={false}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation */}
            {images.length > 1 && (
                <>
                    {/* Previous Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                        title="Previous (←)"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </Button>

                    {/* Next Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                        title="Next (→)"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </Button>

                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/50 rounded-lg max-w-[90vw] overflow-x-auto max-h-24">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    onIndexChange(index)
                                    setScale(1)
                                }}
                                className={cn(
                                    "relative w-16 h-12 flex-shrink-0 rounded overflow-hidden border-2 transition-all",
                                    currentIndex === index
                                        ? "border-primary"
                                        : "border-transparent opacity-50 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                    unoptimized={true}
                                />
                            </button>
                        ))}
                    </div>
                </>
            )}

            {/* Mobile tap indicator */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 md:hidden" onClick={() => {}} />
        </div>
    )
}

// Simple image viewer for single images (used in related posts, etc.)
interface SimpleLightboxProps {
    src: string
    alt: string
    onClose: () => void
}

export function SimpleLightbox({ src, alt, onClose }: SimpleLightboxProps) {
    useEffect(() => {
        document.body.style.overflow = "hidden"
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
        }
        
        window.addEventListener("keydown", handleKeyDown)
        return () => {
            document.body.style.overflow = ""
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [onClose])

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={src}
                    alt={alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                    priority
                    unoptimized={true}
                />
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
                <X className="h-6 w-6" />
            </Button>
        </div>
    )
}
