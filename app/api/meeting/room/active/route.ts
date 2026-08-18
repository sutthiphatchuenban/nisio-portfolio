import { NextResponse } from 'next/server'
import { MeetingStore } from '@/lib/meeting-store'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
    try {
        // Admin-only: used by the meeting hub to auto-enter an unclosed room
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
        }

        // 1. Freshest source: in-memory store
        const storeRooms = MeetingStore.listActiveRooms()
        if (storeRooms.length > 0) {
            const room = storeRooms[0]
            return NextResponse.json({
                success: true,
                room: {
                    code: room.code,
                    name: room.name,
                    hasPasscode: !!(room.passcode && room.passcode.length > 0),
                    hostName: room.hostName,
                    createdAt: room.createdAt,
                },
            })
        }

        // 2. Fallback: persisted DB rooms (survives server restarts)
        try {
            const dbPromise = prisma.meetingRoom.findFirst({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            })
            const dbRoom: any = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000)),
            ])

            if (dbRoom) {
                return NextResponse.json({
                    success: true,
                    room: {
                        code: dbRoom.code,
                        name: dbRoom.name,
                        hasPasscode: !!(dbRoom.passcode && dbRoom.passcode.length > 0),
                        hostName: dbRoom.hostName,
                        createdAt: new Date(dbRoom.createdAt).getTime(),
                    },
                })
            }
        } catch {}

        return NextResponse.json({ success: true, room: null })
    } catch (error: any) {
        console.error('Meeting active room API error:', error)
        return NextResponse.json({ success: false, room: null }, { status: 500 })
    }
}
