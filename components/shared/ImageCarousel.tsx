"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
    images: string[]
    title: string
}

export function ImageCarousel({ images, title }: ImageCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

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

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted group">
                <Image
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
                    className="object-cover transition-all duration-300"
                    priority={currentIndex === 0}
                    unoptimized={true}
                />

                {/* Navigation Arrows - แสดงเมื่อมีมากกว่า 1 รูป */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={goToPrevious}
                        >
                            <ChevronLeft className="h-5 w-5" />
                            <span className="sr-only">Previous image</span>
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                            onClick={goToNext}
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
                                "relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
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
    )
}
