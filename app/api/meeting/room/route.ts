import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action = 'create' } = body

        if (action === 'create') {
            // Require Admin session to create a meeting room
            const session = await getServerSession(authOptions)
            if (!session || session.user.role !== 'ADMIN') {
                return NextResponse.json(
                    { message: 'เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถสร้างห้องประชุมได้' },
                    { status: 403 }
                )
            }

            const { name, passcode, hostName, hostAvatar, hostColor, customCode } = body

            const adminHostName = hostName?.trim() || session.user.name || 'Admin'

            const result = await MeetingStore.createRoom({
                name: name || 'Meeting Room',
                passcode,
                hostName: adminHostName,
                hostAvatar: hostAvatar || (session.user as any).image || null,
                hostColor: hostColor || '#3B82F6',
                customCode,
            })

            return NextResponse.json({
                success: true,
                room: {
                    id: result.room.id,
                    code: result.room.code,
                    name: result.room.name,
                    hasPasscode: !!(result.room.passcode && result.room.passcode.length > 0),
                    hostName: result.room.hostName,
                    hostColor: result.room.hostColor,
                    createdAt: result.room.createdAt,
                },
            })
        }

        if (action === 'join') {
            const { code, passcode, name, avatar, color } = body

            if (!code || code.trim() === '') {
                return NextResponse.json(
                    { message: 'กรุณาระบุรหัสห้องประชุม (Room Code)' },
                    { status: 400 }
                )
            }

            if (!name || name.trim() === '') {
                return NextResponse.json(
                    { message: 'กรุณากรอกชื่อของคุณก่อนเข้าร่วมห้อง' },
                    { status: 400 }
                )
            }

            const joinResult = await MeetingStore.verifyJoin({
                code,
                passcode,
                name,
                avatar,
                color,
            })

            if (!joinResult.success) {
                return NextResponse.json(
                    { message: joinResult.error || 'ไม่สามารถเข้าร่วมห้องได้' },
                    { status: 400 }
                )
            }

            const room = joinResult.room!
            return NextResponse.json({
                success: true,
                room: {
                    id: room.id,
                    code: room.code,
                    name: room.name,
                    hasPasscode: !!(room.passcode && room.passcode.length > 0),
                    hostName: room.hostName,
                    hostColor: room.hostColor,
                    createdAt: room.createdAt,
                },
            })
        }

        return NextResponse.json({ message: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('Meeting room API error:', error)
        return NextResponse.json(
            { message: 'เกิดข้อผิดพลาดในการประมวลผล', error: error.message },
            { status: 500 }
        )
    }
}
