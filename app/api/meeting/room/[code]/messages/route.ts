import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'
import cloudinary from '@/lib/cloudinary'

export const maxDuration = 60

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const { searchParams } = new URL(request.url)
        const after = searchParams.get('after') ? parseInt(searchParams.get('after')!) : undefined

        const messages = MeetingStore.getMessages(code, after)

        return NextResponse.json({
            success: true,
            messages,
        })
    } catch (error: any) {
        console.error('Get messages error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการโหลดข้อความ', error: error.message },
            { status: 500 }
        )
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const {
            senderName,
            senderColor,
            senderAvatar,
            isHost,
            type = 'text',
            content = '',
            fileUrl,
            fileName,
            fileSize,
            fileType,
            filePublicId,
            resourceType,
        } = body

        if (!senderName || senderName.trim() === '') {
            return NextResponse.json({ message: 'Missing sender name' }, { status: 400 })
        }

        if (type === 'text' && (!content || content.trim() === '')) {
            return NextResponse.json({ message: 'Content cannot be empty' }, { status: 400 })
        }

        if (type === 'file' && !fileUrl) {
            return NextResponse.json({ message: 'File URL is required' }, { status: 400 })
        }

        const message = await MeetingStore.addMessage({
            roomCode: code,
            senderName: senderName.trim(),
            senderColor,
            senderAvatar,
            isHost,
            type,
            content: content.trim(),
            fileUrl,
            fileName,
            fileSize,
            fileType,
            filePublicId,
            resourceType,
        })

        return NextResponse.json({
            success: true,
            message,
        })
    } catch (error: any) {
        console.error('Post message error:', error)
        return NextResponse.json(
            { message: 'ไม่สามารถส่งข้อความได้', error: error.message },
            { status: 500 }
        )
    }
}

// Edit a message (sender only)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { messageId, requesterName, content } = body

        if (!messageId || !requesterName) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const result = MeetingStore.editMessage({
            roomCode: code,
            messageId,
            requesterName,
            content: content || '',
        })

        if (!result.success) {
            return NextResponse.json({ message: result.error }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: result.message })
    } catch (error: any) {
        console.error('Edit message error:', error)
        return NextResponse.json(
            { message: 'ไม่สามารถแก้ไขข้อความได้', error: error.message },
            { status: 500 }
        )
    }
}

// Delete a message (sender only); also deletes uploaded files from Cloudinary
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const body = await request.json()
        const { messageId, requesterName } = body

        if (!messageId || !requesterName) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
        }

        const result = MeetingStore.deleteMessage({
            roomCode: code,
            messageId,
            requesterName,
        })

        if (!result.success || !result.deleted) {
            return NextResponse.json({ message: result.error }, { status: 400 })
        }

        // If the deleted message had a file, remove it from Cloudinary storage too
        if (result.deleted.filePublicId) {
            try {
                cloudinary.config({
                    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                    api_key: process.env.CLOUDINARY_API_KEY,
                    api_secret: process.env.CLOUDINARY_API_SECRET,
                    secure: true,
                    timeout: 60000,
                })
                const resType = (result.deleted.resourceType as 'image' | 'video' | 'raw') || 'raw'
                await cloudinary.uploader.destroy(result.deleted.filePublicId, { resource_type: resType })
            } catch (err) {
                console.error(`Failed to delete Cloudinary file ${result.deleted.filePublicId}:`, err)
            }
        }

        return NextResponse.json({ success: true, deleted: result.deleted })
    } catch (error: any) {
        console.error('Delete message error:', error)
        return NextResponse.json(
            { message: 'ไม่สามารถลบข้อความได้', error: error.message },
            { status: 500 }
        )
    }
}
