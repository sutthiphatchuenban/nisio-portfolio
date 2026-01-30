"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, X, ImageIcon, Plus, GripVertical } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MultiImageUploadProps {
    value: string[]
    onChange: (urls: string[]) => void
    disabled?: boolean
    maxImages?: number
}

export function MultiImageUpload({
    value = [],
    onChange,
    disabled,
    maxImages = 10
}: MultiImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Check max images limit
        if (value.length + files.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`)
            return
        }

        setIsUploading(true)

        const uploadPromises = Array.from(files).map(async (file) => {
            if (!file.type.startsWith("image/")) {
                throw new Error(`${file.name} is not an image file`)
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`${file.name} must be less than 5MB`)
            }

            const formData = new FormData()
            formData.append("file", file)

            try {
                const res = await axios.post("/api/upload", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })

                return res.data.url
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    const status = error.response?.status
                    const message = error.response?.data?.message || error.message
                    throw new Error(`Upload failed: ${message} (Status: ${status})`)
                } else {
                    throw new Error('Unknown upload error')
                }
            }
        })

        const results = await Promise.allSettled(uploadPromises)
        const successfulUploads: string[] = []

        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                successfulUploads.push(result.value)
            } else {
                toast.error(`Failed to upload ${files[index].name}: ${result.reason.message || 'Unknown error'}`)
            }
        })

        if (successfulUploads.length > 0) {
            onChange([...value, ...successfulUploads])
            toast.success(`${successfulUploads.length} image(s) uploaded successfully`)
        }

        setIsUploading(false)
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    const handleRemove = (index: number) => {
        const newUrls = value.filter((_, i) => i !== index)
        onChange(newUrls)
    }

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (draggedIndex === null || draggedIndex === index) return

        const newUrls = [...value]
        const [draggedItem] = newUrls.splice(draggedIndex, 1)
        newUrls.splice(index, 0, draggedItem)
        onChange(newUrls)
        setDraggedIndex(index)
    }

    const handleDragEnd = () => {
        setDraggedIndex(null)
    }

    return (
        <div className="space-y-3">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={disabled || isUploading}
                className="hidden"
            />

            {/* Image Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {value.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "relative aspect-video rounded-lg overflow-hidden border bg-muted group cursor-move",
                                draggedIndex === index && "opacity-50 ring-2 ring-primary"
                            )}
                        >
                            <img
                                src={url}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {/* Drag handle indicator */}
                            <div className="absolute top-2 left-2 bg-black/60 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="h-4 w-4 text-white" />
                            </div>
                            {/* Image number badge */}
                            <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}
                            </div>
                            {/* Remove button */}
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(index)}
                                disabled={disabled}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {value.length < maxImages && (
                <div
                    onClick={() => !isUploading && inputRef.current?.click()}
                    className={cn(
                        "w-full rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors bg-muted/50",
                        value.length === 0 ? "aspect-video" : "py-6"
                    )}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Uploading...</p>
                        </>
                    ) : (
                        <>
                            {value.length === 0 ? (
                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            ) : (
                                <Plus className="h-6 w-6 text-muted-foreground" />
                            )}
                            <p className="text-sm text-muted-foreground">
                                {value.length === 0
                                    ? "Click to upload images"
                                    : "Add more images"
                                }
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                                PNG, JPG, GIF up to 5MB • Max {maxImages} images
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Image Count */}
            {value.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                    {value.length} / {maxImages} images • Drag to reorder • First image is the thumbnail
                </p>
            )}
        </div>
    )
}
