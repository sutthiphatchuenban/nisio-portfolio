"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Lightbox } from "@/components/ui/lightbox"

interface ImageCarouselProps {
    images: string[]
    title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted flex items-center justify-center text-muted-foreground">
                No Preview Image
            </div>
        )
    }

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    }

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }

    const goToSlide = (index: number) => {
        setCurrentIndex(index)
    }

    const openLightbox = () => {
        setIsLightboxOpen(true)
    }

    const closeLightbox = () => {
        setIsLightboxOpen(false)
    }

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted group cursor-pointer" onClick={openLightbox}>
                    <Image
                        src={images[currentIndex]}
                        alt={`${title} - Image ${currentIndex + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                        className="object-cover transition-all duration-300 group-hover:scale-105"
                        priority={currentIndex === 0}
                        unoptimized={true}
                    />

                    {/* Fullscreen button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white"
                            onClick={(e) => {
                                e.stopPropagation()
                                openLightbox()
                            }}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Navigation Arrows - แสดงเมื่อมีมากกว่า 1 รูป */}
                    {images.length > 1 && (
                        <>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    goToPrevious()
                                }}
                            >
                                <ChevronLeft className="h-5 w-5" />
                                <span className="sr-only">Previous image</span>
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    goToNext()
                                }}
                            >
                                <ChevronRight className="h-5 w-5" />
                                <span className="sr-only">Next image</span>
                            </Button>

                            {/* Image Counter */}
                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                                {currentIndex + 1} / {images.length}
                            </div>
                        </>
                    )}
                </div>

                {/* Thumbnail Navigation - แสดงเมื่อมีมากกว่า 1 รูป */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {images.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    "relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                                    currentIndex === index
                                        ? "border-primary ring-2 ring-primary/20"
                                        : "border-transparent opacity-60 hover:opacity-100"
                                )}
                            >
                                <Image
                                    src={image}
                                    alt={`Thumbnail ${index + 1}`}
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                    unoptimized={true}
                                />
                            </button>
                        ))}
                    </div>
                )}

                {/* Dot Indicators (Alternative to thumbnails for mobile) */}
                {images.length > 1 && (
                    <div className="flex justify-center gap-2 md:hidden">
                        {images.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-all",
                                    currentIndex === index
                                        ? "bg-primary w-4"
                                        : "bg-muted-foreground/30"
                                )}
                            >
                                <span className="sr-only">Go to image {index + 1}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <Lightbox
                isOpen={isLightboxOpen}
                onClose={closeLightbox}
                images={images}
                currentIndex={currentIndex}
                onIndexChange={setCurrentIndex}
                title={title}
            />
        </>
    )
}
