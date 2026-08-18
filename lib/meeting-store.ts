import prisma from '@/lib/prisma'
import cloudinary from '@/lib/cloudinary'

export interface MeetingRoomData {
    id: string
    code: string
    name: string
    passcode?: string | null
    hostName: string
    hostAvatar?: string | null
    hostColor?: string | null
    isActive: boolean
    createdAt: number
}

export interface MeetingUserData {
    id: string
    name: string
    avatar?: string | null
    color?: string | null
    isHost: boolean
    lastActive: number
    joinedAt: number
}

export interface MeetingReaction {
    emoji: string
    users: string[]
}

export interface MeetingMessageData {
    id: string
    roomCode: string
    senderName: string
    senderColor?: string | null
    senderAvatar?: string | null
    isHost: boolean
    type: 'text' | 'file' | 'system'
    content: string
    fileUrl?: string | null
    fileName?: string | null
    fileSize?: number | null
    fileType?: string | null
    filePublicId?: string | null
    resourceType?: string | null
    reactions: MeetingReaction[]
    createdAt: number
    edited?: boolean
}

export interface MeetingEventData {
    seq: number
    type: 'message_updated' | 'message_deleted'
    messageId: string
    message?: MeetingMessageData
}

// In-Memory Global Store (Fallback and Fast Cache)
declare global {
    var __meetingStore: {
        rooms: Map<string, MeetingRoomData>
        participants: Map<string, Map<string, MeetingUserData>> // roomCode -> (userName -> user)
        messages: Map<string, MeetingMessageData[]> // roomCode -> messages[]
        events: Map<string, MeetingEventData[]> // roomCode -> events[]
        eventSeq: number // global monotonic sequence for events
    } | undefined
}

if (!global.__meetingStore) {
    global.__meetingStore = {
        rooms: new Map(),
        participants: new Map(),
        messages: new Map(),
        events: new Map(),
        eventSeq: 0,
    }
} else {
    // Patch stores created before the events system existed (dev hot-reload)
    if (!global.__meetingStore.events) global.__meetingStore.events = new Map()
    if (typeof global.__meetingStore.eventSeq !== 'number') global.__meetingStore.eventSeq = 0
}

const store = global.__meetingStore!

// Helper to generate a clean, readable room code (e.g. "meet-8392" or "sync-491")
export function generateRoomCode(prefix: string = 'meet'): string {
    const chars = '23456789abcdefghjkmnpqrstuvwxyz'
    let randomPart = ''
    for (let i = 0; i < 4; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `${prefix}-${randomPart}`
}

export const MeetingStore = {
    // 1. Create a room
    async createRoom(data: {
        name: string
        passcode?: string
        hostName: string
        hostAvatar?: string
        hostColor?: string
        customCode?: string
    }): Promise<{ room: MeetingRoomData; isDb: boolean }> {
        const code = (data.customCode?.trim() || generateRoomCode()).toLowerCase().replace(/[^a-z0-9-_]/g, '')
        const now = Date.now()

        const roomObj: MeetingRoomData = {
            id: `room_${now}_${Math.random().toString(36).substring(2, 8)}`,
            code,
            name: data.name.trim() || 'Meeting Room',
            passcode: data.passcode?.trim() || null,
            hostName: data.hostName.trim(),
            hostAvatar: data.hostAvatar || null,
            hostColor: data.hostColor || '#3B82F6',
            isActive: true,
            createdAt: now,
        }

        // Cache in memory
        store.rooms.set(code, roomObj)
        if (!store.participants.has(code)) {
            store.participants.set(code, new Map())
        }
        if (!store.messages.has(code)) {
            store.messages.set(code, [])
        }

        // Add Host as first participant
        const hostUser: MeetingUserData = {
            id: `usr_${now}_host`,
            name: roomObj.hostName,
            avatar: roomObj.hostAvatar,
            color: roomObj.hostColor,
            isHost: true,
            lastActive: now,
            joinedAt: now,
        }
        store.participants.get(code)!.set(roomObj.hostName, hostUser)

        // Add initial system message
        const welcomeMessage: MeetingMessageData = {
            id: `msg_${now}_init`,
            roomCode: code,
            senderName: 'System',
            senderColor: '#6B7280',
            isHost: false,
            type: 'system',
            content: `🎉 ห้องประชุม "${roomObj.name}" ถูกสร้างขึ้นโดย ${roomObj.hostName}`,
            reactions: [],
            createdAt: now,
        }
        store.messages.get(code)!.push(welcomeMessage)

        // Try persisting to Prisma DB asynchronously
        try {
            const dbPromise = prisma.meetingRoom.create({
                data: {
                    code,
                    name: roomObj.name,
                    passcode: roomObj.passcode,
                    hostName: roomObj.hostName,
                    hostAvatar: roomObj.hostAvatar,
                    hostColor: roomObj.hostColor,
                    isActive: true,
                },
            })
            await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500)),
            ])
            return { room: roomObj, isDb: true }
        } catch {
            return { room: roomObj, isDb: false }
        }
    },

    // 1b. List all active (not yet closed) rooms, newest first
    listActiveRooms(): MeetingRoomData[] {
        const rooms: MeetingRoomData[] = []
        for (const room of store.rooms.values()) {
            if (room.isActive) rooms.push(room)
        }
        rooms.sort((a, b) => b.createdAt - a.createdAt)
        return rooms
    },

    // 2. Get room info
    async getRoom(code: string): Promise<MeetingRoomData | null> {        const normalizedCode = code.toLowerCase().trim()
        
        // 1. Check memory store
        if (store.rooms.has(normalizedCode)) {
            return store.rooms.get(normalizedCode)!
        }

        // 2. Check DB
        try {
            const dbPromise = prisma.meetingRoom.findUnique({
                where: { code: normalizedCode },
            })
            const room: any = await Promise.race([
                dbPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000)),
            ])

            if (room && room.isActive) {
                const roomObj: MeetingRoomData = {
                    id: room.id,
                    code: room.code,
                    name: room.name,
                    passcode: room.passcode,
                    hostName: room.hostName,
                    hostAvatar: room.hostAvatar,
                    hostColor: room.hostColor,
                    isActive: room.isActive,
                    createdAt: new Date(room.createdAt).getTime(),
                }
                store.rooms.set(normalizedCode, roomObj)
                return roomObj
            }
        } catch {}

        return null
    },

    // 3. Verify join credentials
    async verifyJoin(data: {
        code: string
        passcode?: string
        name: string
        avatar?: string
        color?: string
    }): Promise<{ success: boolean; error?: string; room?: MeetingRoomData }> {
        const code = data.code.toLowerCase().trim()
        const room = await this.getRoom(code)

        if (!room || !room.isActive) {
            return { success: false, error: 'ไม่พบห้องประชุมนี้ หรือห้องนี้ถูกปิดการประชุมไปแล้ว' }
        }

        if (room.passcode && room.passcode.trim().length > 0) {
            if (!data.passcode || data.passcode.trim() !== room.passcode.trim()) {
                return { success: false, error: 'รหัสผ่านห้อง (Passcode) ไม่ถูกต้อง' }
            }
        }

        const now = Date.now()
        const isHost = data.name.trim() === room.hostName

        // Register participant in memory
        if (!store.participants.has(code)) {
            store.participants.set(code, new Map())
        }
        const userObj: MeetingUserData = {
            id: `usr_${now}_${Math.random().toString(36).substring(2, 6)}`,
            name: data.name.trim(),
            avatar: data.avatar || null,
            color: data.color || (isHost ? room.hostColor || '#3B82F6' : '#10B981'),
            isHost,
            lastActive: now,
            joinedAt: now,
        }
        
        const isNewJoin = !store.participants.get(code)!.has(data.name.trim())
        store.participants.get(code)!.set(data.name.trim(), userObj)

        // If new participant, send system join notification
        if (isNewJoin && !isHost) {
            const joinMsg: MeetingMessageData = {
                id: `msg_${now}_join_${Math.random().toString(36).substring(2, 6)}`,
                roomCode: code,
                senderName: 'System',
                senderColor: '#6B7280',
                isHost: false,
                type: 'system',
                content: `👋 ${data.name.trim()} เข้าร่วมห้องประชุม`,
                reactions: [],
                createdAt: now,
            }
            if (!store.messages.has(code)) store.messages.set(code, [])
            store.messages.get(code)!.push(joinMsg)
        }

        return { success: true, room }
    },

    // 4. Send Message (Text or File)
    async addMessage(data: {
        roomCode: string
        senderName: string
        senderColor?: string
        senderAvatar?: string
        isHost?: boolean
        type?: 'text' | 'file' | 'system'
        content: string
        fileUrl?: string
        fileName?: string
        fileSize?: number
        fileType?: string
        filePublicId?: string
        resourceType?: string
    }): Promise<MeetingMessageData> {
        const code = data.roomCode.toLowerCase().trim()
        const now = Date.now()

        const msg: MeetingMessageData = {
            id: `msg_${now}_${Math.random().toString(36).substring(2, 7)}`,
            roomCode: code,
            senderName: data.senderName,
            senderColor: data.senderColor || '#3B82F6',
            senderAvatar: data.senderAvatar || null,
            isHost: !!data.isHost,
            type: data.type || 'text',
            content: data.content,
            fileUrl: data.fileUrl || null,
            fileName: data.fileName || null,
            fileSize: data.fileSize || null,
            fileType: data.fileType || null,
            filePublicId: data.filePublicId || null,
            resourceType: data.resourceType || null,
            reactions: [],
            createdAt: now,
        }

        if (!store.messages.has(code)) {
            store.messages.set(code, [])
        }
        store.messages.get(code)!.push(msg)

        // Update sender heartbeat
        if (store.participants.has(code) && store.participants.get(code)!.has(data.senderName)) {
            const user = store.participants.get(code)!.get(data.senderName)!
            user.lastActive = now
        }

        return msg
    },

    // 5. Get Messages (supports delta / after timestamp)
    getMessages(roomCode: string, afterTimestamp?: number): MeetingMessageData[] {
        const code = roomCode.toLowerCase().trim()
        const all = store.messages.get(code) || []
        if (afterTimestamp && afterTimestamp > 0) {
            return all.filter((m) => m.createdAt > afterTimestamp)
        }
        return all
    },

    // 5b. Edit a message (only the original sender)
    editMessage(data: {
        roomCode: string
        messageId: string
        requesterName: string
        content: string
    }): { success: boolean; error?: string; message?: MeetingMessageData } {
        const code = data.roomCode.toLowerCase().trim()
        const messages = store.messages.get(code) || []
        const msg = messages.find((m) => m.id === data.messageId)

        if (!msg) return { success: false, error: 'ไม่พบข้อความนี้' }
        if (msg.type === 'system') return { success: false, error: 'ไม่สามารถแก้ไขข้อความระบบได้' }
        if (msg.senderName !== data.requesterName) return { success: false, error: 'คุณแก้ไขได้เฉพาะข้อความของตัวเองเท่านั้น' }

        const newContent = data.content?.trim()
        if (!newContent) return { success: false, error: 'ข้อความไม่สามารถเว้นว่างได้' }

        msg.content = newContent
        msg.edited = true

        this.pushEvent(code, { type: 'message_updated', messageId: msg.id, message: { ...msg } })
        return { success: true, message: { ...msg } }
    },

    // 5c. Delete a message (only the original sender)
    deleteMessage(data: {
        roomCode: string
        messageId: string
        requesterName: string
    }): { success: boolean; error?: string; deleted?: { messageId: string; filePublicId?: string | null; resourceType?: string | null } } {
        const code = data.roomCode.toLowerCase().trim()
        const messages = store.messages.get(code) || []
        const index = messages.findIndex((m) => m.id === data.messageId)

        if (index === -1) return { success: false, error: 'ไม่พบข้อความนี้' }
        const msg = messages[index]
        if (msg.type === 'system') return { success: false, error: 'ไม่สามารถลบข้อความระบบได้' }
        if (msg.senderName !== data.requesterName) return { success: false, error: 'คุณลบได้เฉพาะข้อความของตัวเองเท่านั้น' }

        messages.splice(index, 1)

        this.pushEvent(code, { type: 'message_deleted', messageId: msg.id })
        return {
            success: true,
            deleted: {
                messageId: msg.id,
                filePublicId: msg.filePublicId || null,
                resourceType: msg.resourceType || null,
            },
        }
    },

    // 5d. Get events newer than a sequence number (for SSE broadcast)
    getEvents(code: string, afterSeq: number): MeetingEventData[] {
        const normalized = code.toLowerCase().trim()
        const events = store.events.get(normalized) || []
        return events.filter((e) => e.seq > afterSeq)
    },

    pushEvent(code: string, event: Omit<MeetingEventData, 'seq'>): void {
        const normalized = code.toLowerCase().trim()
        store.eventSeq += 1
        if (!store.events.has(normalized)) store.events.set(normalized, [])
        store.events.get(normalized)!.push({ ...event, seq: store.eventSeq })

        // Trim event history (keep last 200 per room)
        const events = store.events.get(normalized)!
        if (events.length > 200) {
            store.events.set(normalized, events.slice(-200))
        }
    },

    // 6. Toggle Emoji Reaction
    toggleReaction(data: {
        roomCode: string
        messageId: string
        emoji: string
        userName: string
    }): MeetingReaction[] | null {
        const code = data.roomCode.toLowerCase().trim()
        const messages = store.messages.get(code) || []
        const msg = messages.find((m) => m.id === data.messageId)
        if (!msg) return null

        const existingReaction = msg.reactions.find((r) => r.emoji === data.emoji)
        if (existingReaction) {
            const userIndex = existingReaction.users.indexOf(data.userName)
            if (userIndex > -1) {
                existingReaction.users.splice(userIndex, 1)
                if (existingReaction.users.length === 0) {
                    msg.reactions = msg.reactions.filter((r) => r.emoji !== data.emoji)
                }
            } else {
                existingReaction.users.push(data.userName)
            }
        } else {
            msg.reactions.push({
                emoji: data.emoji,
                users: [data.userName],
            })
        }

        return msg.reactions
    },

    // 7. Update Heartbeat & Get Active Users (Online within 30s)
    updateHeartbeat(data: {
        roomCode: string
        userName: string
        userColor?: string
        userAvatar?: string
        isHost?: boolean
    }): MeetingUserData[] {
        const code = data.roomCode.toLowerCase().trim()
        const now = Date.now()

        if (!store.participants.has(code)) {
            store.participants.set(code, new Map())
        }

        const roomUsers = store.participants.get(code)!
        if (roomUsers.has(data.userName)) {
            const user = roomUsers.get(data.userName)!
            user.lastActive = now
            if (data.userColor) user.color = data.userColor
        } else {
            roomUsers.set(data.userName, {
                id: `usr_${now}_${Math.random().toString(36).substring(2, 6)}`,
                name: data.userName,
                avatar: data.userAvatar || null,
                color: data.userColor || '#10B981',
                isHost: !!data.isHost,
                lastActive: now,
                joinedAt: now,
            })
        }

        // Return active users (active in the last 40 seconds)
        const cutoff = now - 40000
        const activeUsers: MeetingUserData[] = []
        for (const user of roomUsers.values()) {
            if (user.lastActive >= cutoff) {
                activeUsers.push(user)
            }
        }

        return activeUsers
    },

    // 8. Leave Room
    leaveRoom(data: { roomCode: string; userName: string }): void {
        const code = data.roomCode.toLowerCase().trim()
        const now = Date.now()

        if (store.participants.has(code)) {
            store.participants.get(code)!.delete(data.userName)
        }

        const leaveMsg: MeetingMessageData = {
            id: `msg_${now}_leave_${Math.random().toString(36).substring(2, 6)}`,
            roomCode: code,
            senderName: 'System',
            senderColor: '#6B7280',
            isHost: false,
            type: 'system',
            content: `🚪 ${data.userName} ออกจากห้องประชุม`,
            reactions: [],
            createdAt: now,
        }

        if (!store.messages.has(code)) store.messages.set(code, [])
        store.messages.get(code)!.push(leaveMsg)
    },

    // 9. Close Room & Delete All Uploaded Files from Cloudinary Storage
    async closeAndCleanupRoom(roomCode: string, requesterName: string): Promise<{
        success: boolean
        error?: string
        deletedFilesCount: number
    }> {
        const code = roomCode.toLowerCase().trim()
        const room = await this.getRoom(code)

        if (!room) {
            return { success: false, error: 'ไม่พบห้องประชุมนี้', deletedFilesCount: 0 }
        }

        // Check if requester is host (or admin)
        if (room.hostName && requesterName && room.hostName.toLowerCase() !== requesterName.toLowerCase()) {
            return { success: false, error: 'เฉพาะผู้สร้างห้อง (Host) เท่านั้นที่สามารถปิดห้องประชุมได้', deletedFilesCount: 0 }
        }

        const messages = store.messages.get(code) || []
        const fileMessages = messages.filter((m) => m.type === 'file' && (m.filePublicId || m.fileUrl))
        let deletedCount = 0

        // Configure Cloudinary
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
            secure: true,
        })

        // 1. Delete all individual files by publicId
        for (const msg of fileMessages) {
            if (msg.filePublicId) {
                try {
                    const resType = (msg.resourceType as 'image' | 'video' | 'raw') || 'raw'
                    await cloudinary.uploader.destroy(msg.filePublicId, { resource_type: resType })
                    deletedCount++
                } catch (err) {
                    console.error(`Failed to delete Cloudinary file ${msg.filePublicId}:`, err)
                }
            }
        }

        // 2. Delete entire room folder from Cloudinary
        try {
            const folderPath = `meeting_files/${code}`
            await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'image' }).catch(() => {})
            await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'raw' }).catch(() => {})
            await cloudinary.api.delete_resources_by_prefix(folderPath, { resource_type: 'video' }).catch(() => {})
            await cloudinary.api.delete_folder(folderPath).catch(() => {})
        } catch (err) {
            console.error(`Error deleting Cloudinary folder meeting_files/${code}:`, err)
        }

        // 3. Mark room as inactive & broadcast close notice
        room.isActive = false
        store.rooms.set(code, room)

        const now = Date.now()
        const closeMsg: MeetingMessageData = {
            id: `msg_${now}_closed`,
            roomCode: code,
            senderName: 'System',
            senderColor: '#EF4444',
            isHost: false,
            type: 'system',
            content: `🛑 โฮสต์ (${requesterName}) ได้ทำการปิดห้องประชุมและลบไฟล์ทั้งหมดในห้องเรียบร้อยแล้ว`,
            reactions: [],
            createdAt: now,
        }
        store.messages.get(code)!.push(closeMsg)

        // 4. Update Database
        try {
            await prisma.meetingRoom.update({
                where: { code },
                data: { isActive: false },
            }).catch(() => {})
        } catch {}

        return {
            success: true,
            deletedFilesCount: Math.max(deletedCount, fileMessages.length),
        }
    },
}
