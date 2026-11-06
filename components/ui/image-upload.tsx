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
    preview?: "default" | "original" | "avatar"
    label?: string
    onUploadingChange?: (uploading: boolean) => void
}

export function ImageUpload({ value, onChange, disabled, preview = "default", label = "รูปภาพ", onUploadingChange }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [dimensions, setDimensions] = useState<{ width: number; height: number; src: string }>()
    const [failedSrc, setFailedSrc] = useState("")
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
        onUploadingChange?.(true)

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
            onUploadingChange?.(false)
            if (inputRef.current) inputRef.current.value = ""
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
                <div className={`relative border bg-muted/40 ${preview === "avatar" ? "h-24 w-24 sm:h-32 sm:w-32 rounded-full mx-auto" : preview === "original" ? "h-56 w-full rounded-xl overflow-hidden" : "w-full aspect-video rounded-lg overflow-hidden"}`}>
                    <img
                        src={value}
                        alt={label}
                        onLoad={(event) => { setDimensions({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight, src: value }); setFailedSrc("") }}
                        onError={() => setFailedSrc(value)}
                        className={`w-full h-full ${preview === "original" ? "object-contain" : "object-cover"} ${preview === "avatar" ? "rounded-full" : ""} ${failedSrc === value ? "invisible" : ""}`}
                    />
                    {failedSrc === value && <p className="absolute inset-0 flex items-center justify-center p-5 text-center text-xs text-muted-foreground">โหลดรูปไม่ได้ กรุณาตรวจสอบ URL</p>}
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className={`absolute h-11 w-11 sm:h-8 sm:w-8 ${preview === "avatar" ? "-top-1 -right-1 rounded-full" : "top-2 right-2"}`}
                        onClick={handleRemove}
                        disabled={disabled || isUploading}
                        aria-label={`นำ${label}ออก`}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled || isUploading}
                    onClick={() => inputRef.current?.click()}
                    className={`w-full ${preview === "default" ? "aspect-video" : "h-44"} rounded-xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary/50 transition-colors bg-muted/30 disabled:opacity-50`}
                >
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                        <>
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">เลือกรูปภาพเพื่ออัปโหลด</p>
                            <p className="text-xs text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                        </>
                    )}
                </button>
            )}

            {preview !== "default" && <p className="text-xs text-muted-foreground">{dimensions && dimensions.src === value && failedSrc !== value ? `${dimensions.width.toLocaleString()} × ${dimensions.height.toLocaleString()} px · ${preview === "original" ? "ภาพต้นฉบับ ไม่ครอป" : "ครอปวงกลมแบบหน้า About"}` : "PNG, JPG, GIF สูงสุด 5MB"}</p>}

            {/* Optional: Manual URL input */}
            <div className="flex gap-2">
                <Input
                    placeholder="หรือวาง URL รูปภาพ…"
                    aria-label={`URL ${label}`}
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled || isUploading}
                    className="min-w-0 text-base sm:text-xs"
                />
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={disabled || isUploading}
                    aria-label={`อัปโหลด${label}`}
                >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}
