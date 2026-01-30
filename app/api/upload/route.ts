import { NextResponse } from 'next/server'
import cloudinary from '@/lib/cloudinary'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const maxDuration = 60 // Increase timeout for Vercel

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 })
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ message: 'Only image files are allowed' }, { status: 400 })
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ message: 'Image must be less than 5MB' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Configure Cloudinary with timeout
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
            timeout: 60000, // 60 seconds timeout
        })

        const uploadResult: any = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { 
                    folder: 'portfolio',
                    timeout: 60000,
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error)
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            )
            uploadStream.end(buffer)
        })

        return NextResponse.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            format: uploadResult.format,
            size: uploadResult.bytes
        })

    } catch (error: any) {
        console.error('Upload Error:', error)
        return NextResponse.json({ 
            message: 'Upload failed', 
            error: error.message || 'Unknown error' 
        }, { status: 500 })
    }
}
