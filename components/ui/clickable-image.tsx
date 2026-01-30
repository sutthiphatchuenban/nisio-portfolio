"use client"

import { useState } from "react"
import Image from "next/image"
import { Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface ClickableImageProps {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
}

export function ClickableImage({ src, alt, fill = true, sizes, className = "" }: ClickableImageProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <div 
                className={`relative cursor-zoom-in group ${className}`}
                onClick={() => setIsOpen(true)}
            >
                {fill ? (
                    <Image
                        src={src}
                        alt={alt}
                        fill
                        sizes={sizes || "100vw"}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={true}
                    />
                ) : (
                    <Image
                        src={src}
                        alt={alt}
                        sizes={sizes || "100vw"}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={true}
                    />
                )}
                
                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 bg-black/50 hover:bg-black/70 text-white"
                    >
                        <Maximize2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Lightbox */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
                    onClick={() => setIsOpen(false)}
                >
                    <div 
                        className="relative w-full h-full max-w-6xl max-h-[90vh] cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >
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
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 text-white hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            )}
        </>
    )
}
