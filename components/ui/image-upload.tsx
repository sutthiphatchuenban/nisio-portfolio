"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X, ImageIcon } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    disabled?: boolean
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB")
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            onChange(res.data.url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error(error)
            toast.error("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemove = () => {
        onChange("")
        if (inputRef.current) {
            inputRef.current.value = ""
        }
    }

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={disabled || isUploading}
                className="hidden"
            />

            {value ? (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                    <img
                        src={value}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleRemove}
                        disabled={disabled}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div
                    onClick={() => !isUploading && inputRef.current?.click()}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors bg-muted/50"
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Click to upload image</p>
                            <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                        </>
                    )}
                </div>
            )}

            {/* Optional: Manual URL input */}
            <div className="flex gap-2">
                <Input
                    placeholder="Or paste image URL..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isUploading}
                    className="text-xs"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || isUploading}
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
