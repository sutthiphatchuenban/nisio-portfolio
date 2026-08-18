import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'

export const maxDuration = 60 // Allow longer upload timeout for large files

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const roomCode = ((formData.get('roomCode') as string) || 'general').toLowerCase().trim()

        if (!file) {
            return NextResponse.json({ message: 'กรุณาเลือกไฟล์ที่ต้องการส่ง' }, { status: 400 })
        }

        // Limit file size to 25MB
        const maxSizeBytes = 25 * 1024 * 1024
        if (file.size > maxSizeBytes) {
            return NextResponse.json({ message: 'ขนาดไฟล์ต้องไม่เกิน 25MB' }, { status: 400 })
        }

        // Strip any path prefix (Windows/macOS drag-drop can include full path in file.name)
        const originalName = (file.name || 'attachment').split(/[\\/]/).pop() || 'attachment'
        const mimeType = file.type || 'application/octet-stream'
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
            timeout: 60000,
        })

        // Determine resource type: 'image', 'video', or 'raw' for documents/zip
        let resourceType: 'image' | 'video' | 'raw' = 'raw'
        if (mimeType.startsWith('image/')) {
            resourceType = 'image'
        } else if (mimeType.startsWith('video/')) {
            resourceType = 'video'
        } else {
            resourceType = 'raw'
        }

        const folderPath = `meeting_files/${roomCode}`

        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderPath,
                    resource_type: resourceType,
                    use_filename: true,
                    unique_filename: true,
                    timeout: 60000,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary meeting upload error:', error)
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            )
            uploadStream.end(buffer)
        })

        return NextResponse.json({
            success: true,
            url: uploadResult.secure_url || uploadResult.url,
            publicId: uploadResult.public_id,
            resourceType: resourceType,
            fileName: originalName,
            fileSize: file.size,
            fileType: mimeType,
            format: uploadResult.format || originalName.split('.').pop() || '',
        })
    } catch (error: any) {
        console.error('Meeting upload error:', error)
        return NextResponse.json(
            { message: 'อัปโหลดไฟล์ไม่สำเร็จ', error: error.message || 'Unknown error' },
            { status: 500 }
        )
    }
}
