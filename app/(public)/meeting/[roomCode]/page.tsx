"use client"

import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
    MessageSquare,
    Users,
    Lock,
    Unlock,
    Copy,
    Check,
    Share2,
    Upload,
    Paperclip,
    Smile,
    Send,
    Download,
    Volume2,
    VolumeX,
    FileText,
    Image as ImageIcon,
    FileCode,
    Archive,
    LogOut,
    Plus,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Eye,
    X,
    Radio,
    Power,
    Trash2,
    AlertTriangle,
    Pencil,
} from "lucide-react"

const AVATAR_COLORS = [
    { name: "Blue", bg: "#3B82F6" },
    { name: "Purple", bg: "#8B5CF6" },
    { name: "Emerald", bg: "#10B981" },
    { name: "Rose", bg: "#F43F5E" },
    { name: "Amber", bg: "#F59E0B" },
    { name: "Cyan", bg: "#06B6D4" },
    { name: "Indigo", bg: "#6366F1" },
    { name: "Fuchsia", bg: "#D946EF" },
]

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "🎉", "🚀", "👀", "👏"]

const EMOJI_CATEGORIES = [
    {
        label: "ยิ้ม & ท่าทาง",
        emojis: ["😀", "😄", "😁", "😆", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😋", "😛", "😜", "🤪", "🤓", "😎", "🥳", "😏", "😢", "😭", "😤", "😡", "🤯", "😳", "🥺", "😱", "😨", "🤗", "🤔", "🤭", "🤫", "😶", "🥵", "🥶", "😴", "🤤", "😪", "🫡", "🫠", "🤡", "👻", "💀", "🤖", "👽"],
    },
    {
        label: "มือ & ใจ",
        emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "👈", "👉", "👆", "👇", "☝️", "👋", "✋", "🖐️", "🖖", "👏", "🙌", "🤝", "🙏", "💪", "🫶", "👊", "✊", "🤛", "🤜", "🫰", "💅", "🦾", "👐"],
    },
    {
        label: "หัวใจ & สัญลักษณ์",
        emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "✨", "⭐", "🌟", "💫", "💥", "💯", "🔥", "🌈", "⚡", "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "📌", "📎", "🔗", "💾", "📁", "📅", "📚", "✏️", "📝", "💬", "💭", "👀", "🧠", "💡", "⏰", "🔔", "🚀", "💎"],
    },
    {
        label: "อาหาร & ธรรมชาติ",
        emojis: ["🍎", "🍊", "🍋", "🍉", "🍇", "🍓", "🍑", "🍍", "🥑", "🍔", "🍟", "🍕", "🌭", "🍿", "🍩", "🍪", "🎂", "🍰", "☕", "🧋", "🍵", "🥤", "🍦", "🍜", "🍚", "🍺", "🍷", "🍽️", "🥗", "🍗", "🐱", "🐶", "🐼", "🦊", "🐸", "🐵", "🦁", "🐯", "🦄", "🌸", "🌹", "🌻", "🌷", "🍀", "🌴", "🌵", "🪐", "🌙", "☀️", "⛅", "🌧️"],
    },
]

interface Participant {
    id: string
    name: string
    avatar?: string | null
    color?: string | null
    isHost: boolean
    lastActive: number
}

interface Reaction {
    emoji: string
    users: string[]
}

interface Message {
    id: string
    roomCode: string
    senderName: string
    senderColor?: string | null
    senderAvatar?: string | null
    isHost: boolean
    type: "text" | "file" | "system"
    content: string
    fileUrl?: string | null
    fileName?: string | null
    fileSize?: number | null
    fileType?: string | null
    filePublicId?: string | null
    resourceType?: string | null
    reactions: Reaction[]
    createdAt: number
    edited?: boolean
}

interface RoomInfo {
    id: string
    code: string
    name: string
    hasPasscode: boolean
    hostName: string
    hostColor?: string
    createdAt: number
}

// Web Audio API notification chime generator
function playNotificationSound() {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) return
        const ctx = new AudioContext()
        
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = "sine"
        osc.frequency.setValueAtTime(587.33, now) // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1) // A5

        gain.gain.setValueAtTime(0.12, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.3)
    } catch {}
}

export default function MeetingRoomPage({
    params,
}: {
    params: Promise<{ roomCode: string }>
}) {
    const router = useRouter()
    const { data: session } = useSession()
    const resolvedParams = use(params)
    const roomCode = resolvedParams.roomCode.toLowerCase().trim()

    // Room & Auth State
    const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null)
    const [currentUser, setCurrentUser] = useState<{
        name: string
        color: string
        isHost: boolean
        passcode?: string
    } | null>(null)
    const [isJoined, setIsJoined] = useState(false)
    const canCloseRoom = session?.user?.role === "ADMIN" || currentUser?.isHost === true
    const [isLoadingRoom, setIsLoadingRoom] = useState(true)

    // Join Gate State
    const [joinName, setJoinName] = useState("")
    const [joinPasscode, setJoinPasscode] = useState("")
    const [joinColor, setJoinColor] = useState(AVATAR_COLORS[0].bg)
    const [isJoining, setIsJoining] = useState(false)

    // Chat State
    const [messages, setMessages] = useState<Message[]>([])
    const [participants, setParticipants] = useState<Participant[]>([])
    const [inputText, setInputText] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState("")
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [isCopiedLink, setIsCopiedLink] = useState(false)
    const [isCopiedCode, setIsCopiedCode] = useState(false)

    // Close Meeting Modal (for Host)
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [isClosingRoom, setIsClosingRoom] = useState(false)

    // UI Drawer & Lightbox
    const [activeSidebarTab, setActiveSidebarTab] = useState<"participants" | "files" | null>(null)
    const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null)
    const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null)
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    // Edit / Delete Message State
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [editText, setEditText] = useState("")
    const [isSavingEdit, setIsSavingEdit] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<Message | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const sseRef = useRef<EventSource | null>(null)
    const lastTimestampRef = useRef<number>(0)

    useEffect(() => {
        const desktop = window.matchMedia("(min-width: 1024px)")
        if (desktop.matches) setActiveSidebarTab("participants")
        const onResize = () => setActiveSidebarTab(null)
        desktop.addEventListener("change", onResize)
        return () => desktop.removeEventListener("change", onResize)
    }, [])

    useEffect(() => {
        if (!activeSidebarTab) return
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setActiveSidebarTab(null)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [activeSidebarTab])

    // 1. Initial Room Info and Auth Check
    useEffect(() => {
        const checkRoomAndAuth = async () => {
            try {
                // Fetch room metadata
                const res = await fetch(`/api/meeting/room/${roomCode}`)
                const data = await res.json()

                if (!res.ok) {
                    toast.error(data.message || "ไม่พบห้องประชุมนี้")
                    router.push("/meeting")
                    return
                }

                setRoomInfo(data.room)

                // Check stored session auth
                const sessionKey = `meeting_auth_${roomCode}`
                const storedAuth = sessionStorage.getItem(sessionKey)

                if (storedAuth) {
                    try {
                        const parsed = JSON.parse(storedAuth)
                        if (parsed && parsed.name) {
                            setCurrentUser(parsed)
                            setIsJoined(true)
                            // Initial fetch
                            fetchMessagesAndHeartbeat(parsed)
                        }
                    } catch {}
                } else {
                    // Pre-fill saved user preferences
                    const savedName = localStorage.getItem("portx_meeting_user_name")
                    const savedColor = localStorage.getItem("portx_meeting_user_color")
                    if (savedName) setJoinName(savedName)
                    if (savedColor) setJoinColor(savedColor)
                }
            } catch (error) {
                console.error("Room check error:", error)
            } finally {
                setIsLoadingRoom(false)
            }
        }

        checkRoomAndAuth()
    }, [roomCode])

    // 2. Fetch Initial Messages and Setup Heartbeat & SSE
    const fetchMessagesAndHeartbeat = async (user: { name: string; color: string; isHost: boolean }) => {
        try {
            // 1. Get existing messages
            const msgRes = await fetch(`/api/meeting/room/${roomCode}/messages`)
            const msgData = await msgRes.json()
            if (msgData.success && Array.isArray(msgData.messages)) {
                setMessages(msgData.messages)
                if (msgData.messages.length > 0) {
                    lastTimestampRef.current = Math.max(...msgData.messages.map((m: Message) => m.createdAt))
                }
            }

            // 2. Send initial heartbeat to get participants
            const hbRes = await fetch(`/api/meeting/room/${roomCode}/heartbeat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userName: user.name,
                    userColor: user.color,
                    isHost: user.isHost,
                }),
            })
            const hbData = await hbRes.json()
            if (hbData.success && Array.isArray(hbData.participants)) {
                setParticipants(hbData.participants)
            }
        } catch (e) {
            console.error("Fetch init error:", e)
        }
    }

    // 3. Setup SSE Realtime Connection & Heartbeat Loop
    useEffect(() => {
        if (!isJoined || !currentUser) return

        // Setup SSE Stream
        const setupSSE = () => {
            if (sseRef.current) sseRef.current.close()

            const sse = new EventSource(`/api/meeting/room/${roomCode}/stream?after=${lastTimestampRef.current}`)
            sseRef.current = sse

            // Listen for room closed by host
            sse.addEventListener("room_closed", (event: any) => {
                toast.error("🛑 โฮสต์ได้ทำการปิดห้องประชุมและลบไฟล์ทั้งหมดเรียบร้อยแล้ว", { duration: 5000 })
                setTimeout(() => {
                    sessionStorage.removeItem(`meeting_auth_${roomCode}`)
                    router.push("/meeting")
                }, 1500)
            })

            // Listen for new incoming messages
            sse.addEventListener("messages", (event: any) => {
                try {
                    const newMsgs: Message[] = JSON.parse(event.data)
                    if (Array.isArray(newMsgs) && newMsgs.length > 0) {
                        setMessages((prev) => {
                            const existingIds = new Set(prev.map((m) => m.id))
                            const uniqueNew = newMsgs.filter((m) => !existingIds.has(m.id))
                            if (uniqueNew.length === 0) return prev

                            // Play sound alert if incoming message is from someone else
                            const hasIncomingFromOthers = uniqueNew.some(
                                (m) => m.senderName !== currentUser.name && m.type !== "system"
                            )
                            if (hasIncomingFromOthers && soundEnabled) {
                                playNotificationSound()
                            }

                            return [...prev, ...uniqueNew]
                        })

                        lastTimestampRef.current = Math.max(
                            lastTimestampRef.current,
                            ...newMsgs.map((m) => m.createdAt)
                        )
                    }
                } catch (e) {
                    console.error("SSE parse error:", e)
                }
            })

            // Listen for edited messages
            sse.addEventListener("message_updated", (event: any) => {
                try {
                    const updatedMsgs: Message[] = JSON.parse(event.data)
                    if (Array.isArray(updatedMsgs) && updatedMsgs.length > 0) {
                        setMessages((prev) => {
                            let changed = false
                            const next = prev.map((m) => {
                                const updated = updatedMsgs.find((u) => u.id === m.id)
                                if (updated) {
                                    changed = true
                                    return { ...m, ...updated }
                                }
                                return m
                            })
                            return changed ? next : prev
                        })
                    }
                } catch (e) {
                    console.error("SSE update parse error:", e)
                }
            })

            // Listen for deleted messages
            sse.addEventListener("message_deleted", (event: any) => {
                try {
                    const deletedIds: string[] = JSON.parse(event.data)
                    if (Array.isArray(deletedIds) && deletedIds.length > 0) {
                        setMessages((prev) => prev.filter((m) => !deletedIds.includes(m.id)))
                    }
                } catch (e) {
                    console.error("SSE delete parse error:", e)
                }
            })

            sse.onerror = () => {
                // EventSource will auto-reconnect
            }
        }

        setupSSE()

        // Heartbeat interval (every 4 seconds) to update active status & sync delta
        const heartbeatInterval = setInterval(async () => {
            try {
                // Heartbeat & get active users
                const res = await fetch(`/api/meeting/room/${roomCode}/heartbeat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userName: currentUser.name,
                        userColor: currentUser.color,
                        isHost: currentUser.isHost,
                    }),
                })
                const data = await res.json()
                if (data.success && Array.isArray(data.participants)) {
                    setParticipants(data.participants)
                }

                // Delta messages sync backup
                const msgRes = await fetch(`/api/meeting/room/${roomCode}/messages?after=${lastTimestampRef.current}`)
                const msgData = await msgRes.json()
                if (msgData.success && Array.isArray(msgData.messages) && msgData.messages.length > 0) {
                    setMessages((prev) => {
                        const existingIds = new Set(prev.map((m) => m.id))
                        const uniqueNew = msgData.messages.filter((m: Message) => !existingIds.has(m.id))
                        if (uniqueNew.length === 0) return prev

                        const hasIncomingFromOthers = uniqueNew.some(
                            (m: Message) => m.senderName !== currentUser.name && m.type !== "system"
                        )
                        if (hasIncomingFromOthers && soundEnabled) {
                            playNotificationSound()
                        }

                        return [...prev, ...uniqueNew]
                    })
                    lastTimestampRef.current = Math.max(
                        lastTimestampRef.current,
                        ...msgData.messages.map((m: Message) => m.createdAt)
                    )
                }
            } catch (err) {}
        }, 4000)

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeatInterval)
            if (sseRef.current) {
                sseRef.current.close()
            }
        }
    }, [isJoined, currentUser, roomCode, soundEnabled])

    // Auto-scroll on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Handle Join Gate Form Submit
    const handleJoinGate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!joinName.trim()) {
            toast.error("กรุณากรอกชื่อของคุณก่อนเข้าร่วมห้อง")
            return
        }

        setIsJoining(true)
        try {
            const res = await fetch("/api/meeting/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "join",
                    code: roomCode,
                    name: joinName.trim(),
                    color: joinColor,
                    passcode: joinPasscode.trim(),
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "ไม่สามารถเข้าร่วมห้องได้")
            }

            const userObj = {
                name: joinName.trim(),
                color: joinColor,
                isHost: joinName.trim() === (roomInfo?.hostName || ""),
                passcode: joinPasscode.trim(),
            }

            // Save to localStorage & sessionStorage
            localStorage.setItem("portx_meeting_user_name", joinName.trim())
            localStorage.setItem("portx_meeting_user_color", joinColor)
            sessionStorage.setItem(`meeting_auth_${roomCode}`, JSON.stringify(userObj))

            setCurrentUser(userObj)
            setIsJoined(true)
            fetchMessagesAndHeartbeat(userObj)
            toast.success("เข้าร่วมห้องประชุมเรียบร้อยแล้ว")
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการเข้าร่วมห้อง")
        } finally {
            setIsJoining(false)
        }
    }

    // Send Text Message
    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setShowEmojiPicker(false)
        if (!inputText.trim() || !currentUser || isSending) return

        const content = inputText.trim()
        setInputText("")
        setIsSending(true)

        // Optimistic UI append
        const tempId = `temp_${Date.now()}`
        const optimisticMsg: Message = {
            id: tempId,
            roomCode,
            senderName: currentUser.name,
            senderColor: currentUser.color,
            senderAvatar: null,
            isHost: currentUser.isHost,
            type: "text",
            content,
            reactions: [],
            createdAt: Date.now(),
        }

        setMessages((prev) => [...prev, optimisticMsg])

        try {
            const res = await fetch(`/api/meeting/room/${roomCode}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderName: currentUser.name,
                    senderColor: currentUser.color,
                    isHost: currentUser.isHost,
                    type: "text",
                    content,
                }),
            })

            const data = await res.json()
            if (data.success && data.message) {
                // Replace temp message with server message
                setMessages((prev) => prev.map((m) => (m.id === tempId ? data.message : m)))
                lastTimestampRef.current = Math.max(lastTimestampRef.current, data.message.createdAt)
            }
        } catch (error) {
            console.error("Send message error:", error)
            toast.error("ส่งข้อความไม่สำเร็จ")
        } finally {
            setIsSending(false)
            if (textareaRef.current) {
                textareaRef.current.focus()
            }
        }
    }

    // Upload & Send File (with folder and publicId tracking for clean deletion)
    const handleFileUpload = async (file: File) => {
        if (!file || !currentUser) return

        if (file.size > 25 * 1024 * 1024) {
            toast.error("ไฟล์มีขนาดเกิน 25MB")
            return
        }

        // Strip path prefix: some drag-drop/paste sources include the full local path in file.name
        const cleanFileName = (file.name || "attachment").split(/[\\/]/).pop() || "attachment"

        setIsUploading(true)
        setUploadProgress(`กำลังอัปโหลด "${cleanFileName}"...`)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("roomCode", roomCode)

            const uploadRes = await fetch("/api/meeting/upload", {
                method: "POST",
                body: formData,
            })

            const uploadData = await uploadRes.json()
            if (!uploadRes.ok) {
                throw new Error(uploadData.message || "อัปโหลดไฟล์ไม่สำเร็จ")
            }

            // Post message with file info including publicId and resourceType
            const msgRes = await fetch(`/api/meeting/room/${roomCode}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderName: currentUser.name,
                    senderColor: currentUser.color,
                    isHost: currentUser.isHost,
                    type: "file",
                    content: cleanFileName,
                    fileUrl: uploadData.url,
                    fileName: uploadData.fileName || cleanFileName,
                    fileSize: uploadData.fileSize,
                    fileType: uploadData.fileType,
                    filePublicId: uploadData.publicId,
                    resourceType: uploadData.resourceType,
                }),
            })

            const msgData = await msgRes.json()
            if (msgData.success && msgData.message) {
                setMessages((prev) => [...prev, msgData.message])
                lastTimestampRef.current = Math.max(lastTimestampRef.current, msgData.message.createdAt)
                toast.success(`ส่งไฟล์ "${cleanFileName}" สำเร็จ`)
            }
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการส่งไฟล์")
        } finally {
            setIsUploading(false)
            setUploadProgress("")
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    // Toggle Emoji Reaction
    const handleToggleReaction = async (messageId: string, emoji: string) => {
        if (!currentUser) return
        setActiveReactionMessageId(null)

        // Optimistic reaction update
        setMessages((prev) =>
            prev.map((msg) => {
                if (msg.id !== messageId) return msg

                const reactions = [...msg.reactions]
                const existing = reactions.find((r) => r.emoji === emoji)

                if (existing) {
                    const userIndex = existing.users.indexOf(currentUser.name)
                    if (userIndex > -1) {
                        existing.users.splice(userIndex, 1)
                        if (existing.users.length === 0) {
                            return { ...msg, reactions: reactions.filter((r) => r.emoji !== emoji) }
                        }
                    } else {
                        existing.users.push(currentUser.name)
                    }
                } else {
                    reactions.push({ emoji, users: [currentUser.name] })
                }
                return { ...msg, reactions }
            })
        )

        try {
            await fetch(`/api/meeting/room/${roomCode}/reactions`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messageId,
                    emoji,
                    userName: currentUser.name,
                }),
            })
        } catch {}
    }

    // Clipboard Paste Handler (Images)
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData?.items
        if (!items) return

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.startsWith("image/")) {
                const file = items[i].getAsFile()
                if (file) {
                    e.preventDefault()
                    handleFileUpload(file)
                    break
                }
            }
        }
    }

    // Drag and Drop Handler
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDraggingOver(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files[0])
        }
    }

    // Copy Link & Code
    const handleCopyLink = () => {
        const link = `${window.location.origin}/meeting/${roomCode}`
        navigator.clipboard.writeText(link)
        setIsCopiedLink(true)
        toast.success("คัดลอกลิงก์ห้องเรียบร้อย!")
        setTimeout(() => setIsCopiedLink(false), 2000)
    }

    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode.toUpperCase())
        setIsCopiedCode(true)
        toast.success("คัดลอกรหัสห้องแล้ว!")
        setTimeout(() => setIsCopiedCode(false), 2000)
    }

    // Host Close Meeting & Delete All Files in Cloudinary
    const handleCloseMeetingRoom = async () => {
        if (!currentUser) return
        setIsClosingRoom(true)

        try {
            const res = await fetch(`/api/meeting/room/${roomCode}/close`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ requesterName: currentUser.name }),
            })

            const data = await res.json()
            if (!res.ok || data.success !== true) {
                throw new Error(data.message || "ไม่สามารถปิดห้องประชุมได้")
            }

            toast.success(data.message || "ปิดห้องประชุมและลบไฟล์ใน Cloudinary ทั้งหมดแล้ว")
            sessionStorage.removeItem(`meeting_auth_${roomCode}`)
            setTimeout(() => {
                router.push("/meeting")
            }, 1000)
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการปิดห้องประชุม")
            setIsClosingRoom(false)
        }
    }

    // Leave Room (Single user exit)
    const handleLeaveRoom = async () => {
        if (currentUser) {
            try {
                await fetch(`/api/meeting/room/${roomCode}/leave`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userName: currentUser.name }),
                })
            } catch {}
        }
        sessionStorage.removeItem(`meeting_auth_${roomCode}`)
        toast.info("คุณได้ออกจากห้องประชุมแล้ว")
        router.push("/meeting")
    }

    // Format file size
    const formatFileSize = (bytes?: number | null) => {
        if (!bytes) return ""
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Helper for file icon
    const getFileIcon = (fileType?: string | null, fileName?: string | null) => {
        const ext = fileName?.split(".").pop()?.toLowerCase() || ""
        if (fileType?.startsWith("image/")) return <ImageIcon className="w-5 h-5 text-blue-500" />
        if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return <Archive className="w-5 h-5 text-amber-500" />
        if (["js", "ts", "jsx", "tsx", "py", "json", "html", "css", "sql"].includes(ext))
            return <FileCode className="w-5 h-5 text-purple-500" />
        return <FileText className="w-5 h-5 text-emerald-500" />
    }

    // Show clean basename for legacy messages that stored full local paths
    const cleanName = (name?: string | null) => {
        if (!name) return ""
        const base = name.split(/[\\/]/).pop() || ""
        return base || name
    }

    // Trigger download through the proxy (same-origin, proper filename + MIME)
    const downloadFile = (url: string, name?: string | null) => {
        const clean = cleanName(name) || "download"
        window.location.href = `/api/meeting/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(clean)}`
    }

    // Insert emoji at cursor position in the message input
    const insertEmoji = (emoji: string) => {
        const el = textareaRef.current
        if (el) {
            const start = el.selectionStart ?? inputText.length
            const end = el.selectionEnd ?? inputText.length
            setInputText(inputText.slice(0, start) + emoji + inputText.slice(end))
            setTimeout(() => {
                el.focus()
                const pos = start + emoji.length
                el.setSelectionRange(pos, pos)
            }, 0)
        } else {
            setInputText((prev) => prev + emoji)
        }
        setShowEmojiPicker(false)
    }

    // Edit message flow
    const startEditMessage = (msg: Message) => {
        if (msg.type !== "text") return
        setEditingMessageId(msg.id)
        setEditText(msg.content)
        setActiveReactionMessageId(null)
        setTimeout(() => {
            const el = document.getElementById(`edit-input-${msg.id}`) as HTMLTextAreaElement | null
            el?.focus()
        }, 50)
    }

    const cancelEditMessage = () => {
        setEditingMessageId(null)
        setEditText("")
    }

    const saveEditMessage = async () => {
        if (!editingMessageId || !currentUser) return
        const content = editText.trim()
        if (!content) {
            toast.error("ข้อความไม่สามารถเว้นว่างได้")
            return
        }

        setIsSavingEdit(true)
        try {
            const res = await fetch(`/api/meeting/room/${roomCode}/messages`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messageId: editingMessageId,
                    requesterName: currentUser.name,
                    content,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "ไม่สามารถแก้ไขข้อความได้")
            }
            if (data.message) {
                setMessages((prev) => prev.map((m) => (m.id === editingMessageId ? data.message : m)))
            }
            toast.success("แก้ไขข้อความแล้ว")
            cancelEditMessage()
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการแก้ไขข้อความ")
        } finally {
            setIsSavingEdit(false)
        }
    }

    // Delete message flow (files also removed from Cloudinary)
    const handleDeleteMessage = async () => {
        if (!deleteTarget || !currentUser) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/meeting/room/${roomCode}/messages`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messageId: deleteTarget.id,
                    requesterName: currentUser.name,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "ไม่สามารถลบข้อความได้")
            }
            setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id))
            setDeleteTarget(null)
            toast.success(deleteTarget.type === "file" ? "ลบข้อความและไฟล์ใน Cloudinary แล้ว" : "ลบข้อความแล้ว")
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการลบข้อความ")
        } finally {
            setIsDeleting(false)
        }
    }

    // Extract shared files from messages for files drawer
    const sharedFiles = messages.filter((m) => m.type === "file" && m.fileUrl)

    // Loading State
    if (isLoadingRoom) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-4 bg-gradient-to-b from-background via-background/90 to-muted/40 overflow-hidden relative">
                <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="h-7 w-7 rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">กำลังโหลดห้องประชุม...</p>
            </div>
        )
    }

    // 4. Join Gate Modal (If not joined yet)
    if (!isJoined || !currentUser) {
        return (
            <div className="min-h-[calc(100vh-3.5rem)] relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-b from-background via-background/90 to-muted/40">
                {/* Ambient Glow Background */}
                <div className="pointer-events-none absolute -top-28 -left-28 w-80 h-80 rounded-full bg-blue-600/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-28 -right-28 w-80 h-80 rounded-full bg-indigo-600/15 blur-3xl" />
                <div className="pointer-events-none absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />

                <Card className="relative w-full max-w-md border-border/60 shadow-2xl backdrop-blur-xl bg-card/80 overflow-hidden">
                    {/* Gradient Top Accent */}
                    <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />

                    <CardHeader className="text-center pb-4 pt-6">
                        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-3 shadow-lg shadow-primary/20">
                            <Users className="w-7 h-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                            เข้าร่วมห้องประชุม
                        </CardTitle>
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <span className="text-sm text-muted-foreground">{roomInfo?.name || "Meeting Room"}</span>
                            <Badge variant="outline" className="font-mono text-xs uppercase bg-background border-primary/30 text-primary">
                                #{roomCode}
                            </Badge>
                        </div>
                        {roomInfo?.hasPasscode && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25 mx-auto mt-2.5">
                                <Lock className="w-3 h-3" />
                                <span>ห้องนี้มีการตั้งรหัสผ่าน</span>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleJoinGate} className="space-y-4">
                            {/* Display Name */}
                            <div className="space-y-2">
                                <Label htmlFor="gate-name" className="text-sm font-medium">
                                    ชื่อของคุณ (Display Name) <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="gate-name"
                                    placeholder="กรอกชื่อของคุณที่ต้องการให้คนในห้องเห็น"
                                    value={joinName}
                                    onChange={(e) => setJoinName(e.target.value)}
                                    required
                                    autoFocus
                                    className="bg-background/80 border-border/60 focus-visible:ring-primary/40 h-11"
                                />
                            </div>

                            {/* Passcode (If required) */}
                            {roomInfo?.hasPasscode && (
                                <div className="space-y-2">
                                    <Label htmlFor="gate-passcode" className="text-sm font-medium">
                                        รหัสผ่านห้อง (Passcode) <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="gate-passcode"
                                        type="password"
                                        placeholder="กรอกรหัสผ่านเพื่อเข้าห้อง"
                                        value={joinPasscode}
                                        onChange={(e) => setJoinPasscode(e.target.value)}
                                        required
                                        className="bg-background/80 border-border/60 focus-visible:ring-primary/40 h-11"
                                    />
                                </div>
                            )}

                            {/* Color Tag */}
                            <div className="space-y-2 pt-1">
                                <Label className="text-xs text-muted-foreground">เลือกสีประจำตัว</Label>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {AVATAR_COLORS.map((c) => (
                                        <button
                                            key={c.bg}
                                            type="button"
                                            onClick={() => setJoinColor(c.bg)}
                                            style={{ backgroundColor: c.bg }}
                                            className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center shadow-sm ${
                                                joinColor === c.bg
                                                    ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-md"
                                                    : "opacity-70 hover:opacity-100 hover:scale-105"
                                            }`}
                                        >
                                            {joinColor === c.bg && <Check className="w-3.5 h-3.5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isJoining}
                                className="w-full mt-2 h-12 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 relative overflow-hidden group"
                            >
                                {!isJoining && <span className="pointer-events-none absolute inset-0 shimmer opacity-40" />}
                                {isJoining ? (
                                    <span className="flex items-center gap-2">
                                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                        กำลังเข้าสู่ห้อง...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Radio className="w-4 h-4" />
                                        เข้าสู่ห้องประชุมทันที
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 5. Main Real-time Meeting Room View
    return (
        <div
            className="flex h-full min-h-0 min-w-0 flex-col bg-background relative overflow-hidden select-text"
            onDragOver={(e) => {
                e.preventDefault()
                setIsDraggingOver(true)
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
        >
            {/* Drag & Drop Visual Overlay */}
            <AnimatePresence>
                {isDraggingOver && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-primary/15 backdrop-blur-sm border-4 border-dashed border-primary/70 flex flex-col items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="p-6 rounded-3xl bg-background/95 shadow-2xl border border-primary/30 flex flex-col items-center gap-3 backdrop-blur-xl">
                            <div className="w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
                                <Upload className="w-8 h-8 animate-bounce" />
                            </div>
                            <h3 className="text-xl font-bold">วางไฟล์ที่นี่เพื่อส่งเข้าห้องประชุม</h3>
                            <p className="text-sm text-muted-foreground">รองรับไฟล์เอกสาร รูปภาพ สูงสุด 25MB</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Room Header Top Bar */}
            <header className="min-h-14 border-b bg-card/70 backdrop-blur-xl px-3 py-2 sm:px-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between shrink-0 z-20">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    {/* Room Logo Chip */}
                    <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                        <Radio className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h2 className="font-bold text-sm sm:text-base truncate max-w-[calc(100vw-5rem)] sm:max-w-[240px]">
                                {roomInfo?.name || "Meeting Room"}
                            </h2>
                            {roomInfo?.hasPasscode && (
                                <span title="Password Protected">
                                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            <span className="font-mono font-semibold text-primary uppercase">#{roomCode}</span>
                            <span className="hidden sm:inline text-muted-foreground/50">•</span>
                            <span className="hidden sm:inline">โฮสต์: {roomInfo?.hostName}</span>
                        </div>
                    </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex w-full flex-wrap items-center gap-0.5 sm:w-auto sm:gap-1.5 shrink-0">
                    {/* Copy Link Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-9 px-2.5 sm:px-3.5 text-xs flex items-center gap-1.5 bg-background/60 border-border/60 hover:border-primary/40 hover:bg-background rounded-lg"
                        title="แชร์ลิงก์ให้เพื่อน"
                    >
                        {isCopiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                        <span className="hidden md:inline">{isCopiedLink ? "คัดลอกแล้ว!" : "แชร์ลิงก์"}</span>
                    </Button>

                    {/* Copy Code Button */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyCode}
                        className="h-9 px-2 text-xs flex items-center gap-1.5 rounded-lg text-muted-foreground hover:text-foreground"
                        title="คัดลอกรหัสห้อง"
                    >
                        {isCopiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isCopiedCode ? "คัดลอกแล้ว" : "คัดลอกรหัส"}</span>
                    </Button>

                    {/* Notification Sound Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            setSoundEnabled(!soundEnabled)
                            toast.info(soundEnabled ? "ปิดเสียงแจ้งเตือนแล้ว" : "เปิดเสียงแจ้งเตือนแล้ว")
                        }}
                        className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                        title={soundEnabled ? "เปิดเสียงอยู่ (คลิกเพื่อปิด)" : "ปิดเสียงอยู่ (คลิกเพื่อเปิด)"}
                    >
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
                    </Button>

                    {/* Toggle Participants Sidebar */}
                    <Button
                        variant={activeSidebarTab ? "default" : "outline"}
                        size="sm"
                        aria-label="ผู้เข้าร่วมและไฟล์แชร์"
                        aria-expanded={activeSidebarTab !== null}
                        aria-controls="meeting-sidebar"
                        onClick={() => setActiveSidebarTab(activeSidebarTab ? null : "participants")}
                        className={`h-9 px-2.5 text-xs flex items-center gap-1.5 font-medium rounded-lg ${
                            activeSidebarTab
                                ? "bg-primary text-primary-foreground hover:bg-primary/90 border-transparent shadow-md shadow-primary/20"
                                : "bg-background/60 border-border/60 hover:border-primary/40"
                        }`}
                    >
                        <span className="relative hidden sm:flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <Users className="w-3.5 h-3.5" />
                        <span>{participants.length}</span>
                    </Button>

                    {/* Host End Meeting & Delete Storage Button */}
                    {canCloseRoom && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowCloseModal(true)}
                            className="h-9 px-2.5 sm:px-3 text-xs flex items-center gap-1.5 font-medium shadow-md shadow-destructive/20 bg-red-700 text-white hover:bg-red-800 rounded-lg"
                            title="ปิดห้องประชุมและลบไฟล์ทั้งหมดใน Cloudinary"
                            aria-label="ปิดห้องประชุม"
                        >
                            <Power className="w-3.5 h-3.5" />
                            <span>ปิดห้อง<span className="hidden sm:inline">ประชุม</span></span>
                        </Button>
                    )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLeaveRoom}
                            className="h-9 w-9 rounded-lg text-destructive hover:bg-destructive/10"
                            title="ออกจากห้องประชุม"
                            aria-label="ออกจากห้องประชุม"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                </div>
            </header>

            {/* Middle Section: Chat Feed + Sidebar */}
            <div className="min-h-0 min-w-0 flex-1 flex overflow-hidden relative">
                {/* Chat Feed (Main Area) */}
                <div className="min-h-0 min-w-0 flex-1 flex flex-col bg-background/50 overflow-hidden">
                    {/* Messages Scroll Area */}
                    <div role="log" aria-label="ข้อความในห้องประชุม" className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-4">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-muted-foreground">
                                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 opacity-60" />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="font-semibold text-foreground text-sm">ยังไม่มีข้อความในห้องนี้</p>
                                    <p className="text-xs max-w-sm">
                                        พิมพ์ข้อความ หรือส่งไฟล์/รูปภาพเพื่อเริ่มการสนทนาได้เลย!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const isSelf = msg.senderName === currentUser.name
                                const isSystem = msg.type === "system"

                                // System message pill
                                if (isSystem) {
                                    return (
                                        <div key={msg.id || index} className="flex justify-center my-2">
                                            <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-muted/80 to-muted/40 text-muted-foreground text-[11px] font-medium border border-border/50 shadow-sm flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3 text-amber-500" />
                                                <span>{msg.content}</span>
                                            </div>
                                        </div>
                                    )
                                }

                                const msgTime = new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })

                                return (
                                    <div
                                        key={msg.id || index}
                                        className={`flex flex-col group relative ${isSelf ? "items-end" : "items-start"}`}
                                    >
                                        {/* Sender Name & Badge (for others) */}
                                        {!isSelf && (
                                            <div className="flex items-center gap-1.5 mb-1.5 px-1 text-xs">
                                                <span
                                                    className="font-semibold"
                                                    style={{ color: msg.senderColor || "#3B82F6" }}
                                                >
                                                    {msg.senderName}
                                                </span>
                                                {msg.isHost && (
                                                    <Badge className="h-4 px-1 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                                        Host 👑
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        {/* Message Bubble Container */}
                                        <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${isSelf ? "justify-end" : ""}`}>
                                            {/* Avatar (for others) */}
                                            {!isSelf && (
                                                <div
                                                    className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-md ring-2 ring-background"
                                                    style={{ backgroundColor: msg.senderColor || "#3B82F6" }}
                                                >
                                                    {msg.senderName.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div className={`flex flex-col gap-1 min-w-0 max-w-full ${isSelf ? "items-end" : "items-start"}`}>
                                                {/* Bubble Content */}
                                                <div
                                                    className={`w-fit max-w-full rounded-2xl px-4 py-2.5 shadow-sm text-sm break-words relative ${
                                                        editingMessageId === msg.id
                                                            ? "bg-card border border-primary/50 text-card-foreground shadow-md"
                                                            : isSelf
                                                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 rounded-br-sm"
                                                                : "bg-card border border-border/60 text-card-foreground shadow-sm rounded-bl-sm"
                                                    }`}
                                                >
                                                    {/* Edit Mode */}
                                                    {editingMessageId === msg.id ? (
                                                        <div className="space-y-2 min-w-[220px]">
                                                            <Textarea
                                                                id={`edit-input-${msg.id}`}
                                                                value={editText}
                                                                onChange={(e) => setEditText(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "Enter" && !e.shiftKey) {
                                                                        e.preventDefault()
                                                                        saveEditMessage()
                                                                    }
                                                                    if (e.key === "Escape") {
                                                                        cancelEditMessage()
                                                                    }
                                                                }}
                                                                rows={2}
                                                                className="min-h-[60px] bg-background text-foreground border-border/50 text-sm"
                                                            />
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={cancelEditMessage}
                                                                    disabled={isSavingEdit}
                                                                    className="h-7 px-2 text-[11px]"
                                                                >
                                                                    ยกเลิก
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    onClick={saveEditMessage}
                                                                    disabled={isSavingEdit || !editText.trim()}
                                                                    className="h-7 px-2.5 text-[11px] font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                                                                >
                                                                    {isSavingEdit ? (
                                                                        <span className="h-3 w-3 rounded-full border-2 border-primary-foreground/40 border-t-primary-foreground animate-spin" />
                                                                    ) : (
                                                                        "บันทึก"
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                    <>
                                                    {/* Text Message */}
                                                    {msg.type === "text" && (
                                                        <p className="whitespace-pre-wrap leading-relaxed select-text">
                                                            {msg.content}
                                                        </p>
                                                    )}

                                                    {/* File / Image Attachment */}
                                                    {msg.type === "file" && msg.fileUrl && (
                                                        <div className="space-y-2">
                                                            {msg.fileType?.startsWith("image/") ? (
                                                                <div className="rounded-xl overflow-hidden border border-black/10 bg-black/5 max-w-sm">
                                                                    <img
                                                                        src={msg.fileUrl}
                                                                        alt={cleanName(msg.fileName) || "attachment"}
                                                                        className="w-full max-h-72 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                                                        onClick={() =>
                                                                            setLightboxImage({
                                                                                url: msg.fileUrl!,
                                                                                name: cleanName(msg.fileName) || "Image",
                                                                            })
                                                                        }
                                                                    />
                                                                    <div className="p-2 flex items-center justify-between text-xs bg-card/90">
                                                                        <span className="truncate max-w-[180px] font-medium">
                                                                            {cleanName(msg.fileName)}
                                                                        </span>
                                                                        <a
                                                                            href={`/api/meeting/download?url=${encodeURIComponent(msg.fileUrl!)}&name=${encodeURIComponent(cleanName(msg.fileName) || "download")}`}
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="flex items-center gap-1 text-primary hover:underline text-[11px]"
                                                                        >
                                                                            <Download className="w-3 h-3" />
                                                                            โหลด
                                                                        </a>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div
                                                                    className="flex items-center gap-3 p-3 rounded-xl bg-background/80 border border-border/60 max-w-sm cursor-pointer hover:border-primary/40 hover:bg-background transition-all group/file"
                                                                    onClick={() => downloadFile(msg.fileUrl!, cleanName(msg.fileName))}
                                                                    title="คลิกเพื่อดาวน์โหลด"
                                                                >
                                                                    <div className="p-2 rounded-lg bg-muted shrink-0">
                                                                        {getFileIcon(msg.fileType, cleanName(msg.fileName))}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="text-xs font-semibold truncate">
                                                                            {cleanName(msg.fileName) || msg.content}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {formatFileSize(msg.fileSize)}
                                                                        </p>
                                                                    </div>
                                                                    <div
                                                                        className="p-2 rounded-lg bg-primary/10 text-primary group-hover/file:bg-primary/20 transition-colors shrink-0"
                                                                        title="ดาวน์โหลดไฟล์"
                                                                    >
                                                                        <Download className="w-4 h-4" />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Floating Action Buttons (own message: edit / delete / react) */}
                                                    <div
                                                        className={`absolute -top-3 ${
                                                            isSelf ? "left-0 -translate-x-full pr-1" : "right-0 translate-x-full pl-1"
                                                        } opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1`}
                                                    >
                                                        {isSelf && msg.type === "text" && (
                                                            <button
                                                                type="button"
                                                                onClick={() => startEditMessage(msg)}
                                                                className="p-1.5 rounded-full bg-card border border-border/70 shadow-md hover:bg-muted text-muted-foreground hover:text-primary hover:scale-110 transition-all"
                                                                title="แก้ไขข้อความ"
                                                            >
                                                                <Pencil className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        {isSelf && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeleteTarget(msg)}
                                                                className="p-1.5 rounded-full bg-card border border-border/70 shadow-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive hover:scale-110 transition-all"
                                                                title="ลบข้อความ"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setActiveReactionMessageId(
                                                                    activeReactionMessageId === msg.id ? null : msg.id
                                                                )
                                                            }
                                                            className="p-1.5 rounded-full bg-primary text-primary-foreground border border-primary-foreground/20 shadow-md shadow-primary/20 hover:scale-110 transition-transform"
                                                            title="Add Reaction"
                                                        >
                                                            <Smile className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Quick Emoji Reaction Popup */}
                                                    {activeReactionMessageId === msg.id && (
                                                        <div
                                                            className={`absolute z-30 -top-11 ${
                                                                isSelf ? "right-0" : "left-0"
                                                            } p-1.5 rounded-full bg-card/95 backdrop-blur-md border border-border/80 shadow-xl flex items-center gap-0.5 animate-in fade-in zoom-in-95`}
                                                        >
                                                            {QUICK_EMOJIS.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    type="button"
                                                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-primary/10 text-base transition-transform hover:scale-125"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                    </>
                                                )}
                                                </div>

                                                {/* Reactions Badges */}
                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className={`flex flex-wrap gap-1 ${isSelf ? "justify-end" : "justify-start"}`}>
                                                        {msg.reactions.map((r) => {
                                                            const hasReacted = r.users.includes(currentUser.name)
                                                            return (
                                                                <button
                                                                    key={r.emoji}
                                                                    type="button"
                                                                    onClick={() => handleToggleReaction(msg.id, r.emoji)}
                                                                    className={`px-1.5 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1 transition-all ${
                                                                        hasReacted
                                                                            ? "bg-primary/10 border-primary/30 text-primary"
                                                                            : "bg-card/70 border-border/60 text-muted-foreground hover:bg-muted"
                                                                    }`}
                                                                >
                                                                    <span>{r.emoji}</span>
                                                                    <span className="text-[10px] font-bold">{r.users.length}</span>
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                )}

                                                {/* Timestamp */}
                                                <div className={`text-[10px] text-muted-foreground ${isSelf ? "text-right px-1" : "text-left px-1"}`}>
                                                    {msgTime}
                                                    {msg.edited && <span className="italic opacity-80"> • แก้ไขแล้ว</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Upload Progress Bar */}
                    {isUploading && (
                        <div className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center justify-between text-xs text-primary animate-pulse">
                            <span className="flex items-center gap-2">
                                <Upload className="w-3.5 h-3.5 animate-bounce" />
                                <span>{uploadProgress || "กำลังอัปโหลดไฟล์..."}</span>
                            </span>
                            <span className="h-3 w-3 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
                        </div>
                    )}

                    {/* Chat Input Bar */}
                    <div className="p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:p-4 border-t bg-card/50 backdrop-blur-xl shrink-0">
                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-end gap-1.5 max-w-5xl mx-auto bg-background/80 border border-border/60 rounded-2xl p-2 shadow-lg focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10 transition-all relative"
                        >
                            {/* File Upload Hidden Input */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                        handleFileUpload(e.target.files[0])
                                    }
                                }}
                                className="hidden"
                            />

                            {/* Emoji Picker */}
                            <div className="relative shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className={`h-10 w-10 rounded-xl transition-colors ${
                                        showEmojiPicker
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                                    }`}
                                    title="เลือก Emoji"
                                >
                                    <Smile className="w-5 h-5" />
                                </Button>

                                {/* Emoji Popup */}
                                {showEmojiPicker && (
                                    <>
                                        <div className="fixed inset-0 z-30" onClick={() => setShowEmojiPicker(false)} />
                                        <div className="absolute bottom-full mb-2 left-0 w-[280px] sm:w-80 z-40 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/70 shadow-2xl overflow-hidden">
                                            <div className="max-h-64 overflow-y-auto p-2 space-y-2">
                                                {EMOJI_CATEGORIES.map((cat) => (
                                                    <div key={cat.label}>
                                                        <p className="text-[10px] font-semibold text-muted-foreground px-1 pb-1 uppercase tracking-wider sticky top-0 bg-card/95 pt-1">
                                                            {cat.label}
                                                        </p>
                                                        <div className="grid grid-cols-8 gap-0.5">
                                                            {cat.emojis.map((emoji) => (
                                                                <button
                                                                    key={emoji}
                                                                    type="button"
                                                                    onClick={() => insertEmoji(emoji)}
                                                                    className="h-8 flex items-center justify-center rounded-lg text-lg hover:bg-primary/10 transition-colors"
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Attach File Button */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                                title="แนบไฟล์หรือรูปภาพ (สูงสุด 25MB)"
                            >
                                <Paperclip className="w-5 h-5" />
                            </Button>

                            {/* Text Input Area */}
                            <div className="min-w-0 flex-1 relative">
                                <Textarea
                                    ref={textareaRef}
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage()
                                        }
                                    }}
                                    onPaste={handlePaste}
                                    aria-label="พิมพ์ข้อความ"
                                    placeholder="พิมพ์ข้อความ..."
                                    rows={1}
                                    className="min-h-[42px] max-h-32 py-2.5 px-2 bg-transparent resize-none text-base sm:text-sm leading-relaxed border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                />
                            </div>

                            {/* Send Button */}
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!inputText.trim() || isSending}
                                className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-40 disabled:shadow-none"
                                title="ส่งข้อความ"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Collapsible Right Sidebar (Participants & Shared Files) */}
                <AnimatePresence>
                    {activeSidebarTab && (
                        <motion.button
                            key="sidebar-backdrop"
                            type="button"
                            aria-label="ปิดแผงผู้เข้าร่วมและไฟล์แชร์"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setActiveSidebarTab(null)}
                            className="absolute inset-0 z-30 bg-black/35 backdrop-blur-sm lg:hidden"
                        />
                    )}
                    {activeSidebarTab && (
                        <motion.aside
                            key="sidebar"
                            id="meeting-sidebar"
                            aria-label="ผู้เข้าร่วมและไฟล์แชร์"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-x-2 bottom-2 z-40 max-h-[80%] rounded-2xl border bg-card flex flex-col min-h-0 overflow-hidden shadow-2xl lg:relative lg:inset-auto lg:z-10 lg:h-full lg:max-h-none lg:w-72 lg:shrink-0 lg:rounded-none lg:border-0 lg:border-l lg:shadow-none"
                        >
                            {/* Sidebar Tab Header */}
                            <div className="p-3 border-b flex items-center justify-between bg-gradient-to-r from-muted/50 to-muted/20">
                                <div className="flex items-center gap-1 bg-muted/60 border border-border/40 rounded-lg p-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveSidebarTab("participants")}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                            activeSidebarTab === "participants"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        ผู้เข้าร่วม ({participants.length})
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveSidebarTab("files")}
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                            activeSidebarTab === "files"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        ไฟล์แชร์ ({sharedFiles.length})
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    aria-label="ปิดแผงรายชื่อ"
                                    onClick={() => setActiveSidebarTab(null)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/80 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Sidebar Content */}
                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                                {activeSidebarTab === "participants" ? (
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            ออนไลน์ขณะนี้
                                        </div>
                                        <div className="space-y-1.5">
                                            {participants.map((p) => {
                                                const isYou = p.name === currentUser.name
                                                return (
                                                    <div
                                                        key={p.id || p.name}
                                                        className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 border border-border/40 hover:bg-background hover:border-primary/30 transition-all"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            <div className="relative">
                                                                <div
                                                                    className="w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-md ring-2 ring-background"
                                                                    style={{ backgroundColor: p.color || "#3B82F6" }}
                                                                >
                                                                    {p.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-card" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-semibold truncate flex items-center gap-1">
                                                                    <span>{p.name}</span>
                                                                    {isYou && (
                                                                        <span className="text-[10px] font-normal text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                                                            คุณ
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {p.isHost && (
                                                            <Badge className="h-4.5 px-1.5 text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 shrink-0">
                                                                Host 👑
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-[11px] font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                                            ไฟล์และรูปภาพทั้งหมด
                                        </div>
                                        {sharedFiles.length === 0 ? (
                                            <div className="py-10 text-center text-xs text-muted-foreground space-y-1.5">
                                                <div className="w-12 h-12 mx-auto rounded-xl bg-muted/50 flex items-center justify-center mb-2">
                                                    <FileText className="w-6 h-6 opacity-40" />
                                                </div>
                                                <p>ยังไม่มีไฟล์ที่แชร์ในห้องนี้</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1.5">
                                                {sharedFiles.map((fileMsg) => (
                                                    <div
                                                        key={fileMsg.id}
                                                        onClick={() => downloadFile(fileMsg.fileUrl!, cleanName(fileMsg.fileName))}
                                                        className="p-2.5 rounded-xl bg-background/60 border border-border/40 hover:bg-background hover:border-primary/30 transition-all flex items-center justify-between gap-2 cursor-pointer group/file"
                                                        title="คลิกเพื่อดาวน์โหลด"
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0">
                                                            <div className="p-2 rounded-lg bg-muted/70 shrink-0">
                                                                {getFileIcon(fileMsg.fileType, cleanName(fileMsg.fileName))}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-xs font-medium truncate">
                                                                    {cleanName(fileMsg.fileName) || fileMsg.content}
                                                                </p>
                                                                <p className="text-[10px] text-muted-foreground">
                                                                    {fileMsg.senderName} • {formatFileSize(fileMsg.fileSize)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div
                                                            className="p-2 rounded-lg text-primary group-hover/file:bg-primary/10 transition-colors shrink-0"
                                                            title="ดาวน์โหลด"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* Host Close Meeting Confirmation Modal */}
            <AnimatePresence>
                {showCloseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="meeting-close-title"
                            className="bg-card/95 backdrop-blur-xl border border-destructive/30 shadow-2xl rounded-2xl p-6 max-w-md w-full max-h-[calc(100dvh-2rem)] space-y-4 overflow-x-hidden overflow-y-auto relative"
                        >
                            <div className="flex items-center gap-3 text-destructive">
                                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 id="meeting-close-title" className="font-bold text-lg text-foreground">ยืนยันปิดห้องประชุม</h3>
                                    <p className="text-xs text-muted-foreground">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-muted/50 text-xs space-y-2 border border-border/40">
                                <p className="text-foreground font-medium">
                                    เมื่อคุณปิดห้องประชุม ระบบจะดำเนินการดังนี้:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    <li><strong className="text-destructive">ลบไฟล์และรูปภาพทั้งหมด</strong> ที่อัปโหลดในห้องนี้ออกจาก Cloudinary ทันที เพื่อประหยัดพื้นที่ Storage</li>
                                    <li>ตัดการเชื่อมต่อผู้เข้าร่วมทุกคนและปิดห้องนี้ถาวร</li>
                                </ul>
                            </div>

                            <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:items-center sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCloseModal(false)}
                                    disabled={isClosingRoom}
                                    className="w-full rounded-lg sm:w-auto"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleCloseMeetingRoom}
                                    disabled={isClosingRoom}
                                    className="w-full bg-red-700 text-white hover:bg-red-800 font-semibold rounded-lg shadow-md shadow-destructive/20 border-0 sm:w-auto"
                                >
                                    {isClosingRoom ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                            กำลังลบไฟล์และปิดห้อง...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Trash2 className="w-4 h-4" />
                                            ปิดห้อง & ลบไฟล์ทั้งหมด
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Message Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-card/95 backdrop-blur-xl border border-destructive/30 shadow-2xl rounded-2xl p-6 max-w-md w-full space-y-4 overflow-hidden relative"
                        >
                            <div className="pointer-events-none absolute -top-16 -right-16 w-40 h-40 rounded-full bg-destructive/10 blur-3xl" />
                            <div className="flex items-center gap-3 text-destructive">
                                <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                                    <Trash2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground">
                                        {deleteTarget.type === "file" ? "ลบข้อความและไฟล์นี้?" : "ลบข้อความนี้?"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-muted/50 text-xs space-y-2 border border-border/40">
                                <p className="text-foreground font-medium truncate">
                                    "{deleteTarget.type === "file" ? cleanName(deleteTarget.fileName) || deleteTarget.content : deleteTarget.content}"
                                </p>
                                {deleteTarget.type === "file" && (
                                    <p className="text-muted-foreground">
                                        ไฟล์นี้จะถูกลบออกจากห้องประชุมและ <strong className="text-destructive">Cloudinary Storage ทันที</strong> ฝั่งคนอื่นก็จะไม่เห็นอีก
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="rounded-lg"
                                >
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleDeleteMessage}
                                    disabled={isDeleting}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold rounded-lg shadow-md shadow-destructive/20 border-0"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-3.5 w-3.5 rounded-full border-2 border-destructive-foreground/40 border-t-destructive-foreground animate-spin" />
                                            กำลังลบ...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5">
                                            <Trash2 className="w-4 h-4" />
                                            {deleteTarget.type === "file" ? "ลบข้อความ & ไฟล์" : "ลบข้อความ"}
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Fullscreen Image Lightbox Modal */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightboxImage(null)}
                        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
                    >
                        <div className="absolute top-4 right-4 flex items-center gap-2">
                            <a
                                href={`/api/meeting/download?url=${encodeURIComponent(lightboxImage.url)}&name=${encodeURIComponent(cleanName(lightboxImage.name) || "download")}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                                title="ดาวน์โหลดรูป"
                            >
                                <Download className="w-5 h-5" />
                            </a>
                            <button
                                type="button"
                                onClick={() => setLightboxImage(null)}
                                className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-md transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <img
                            src={lightboxImage.url}
                            alt={lightboxImage.name}
                            onClick={(e) => e.stopPropagation()}
                            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                        />
                        <p className="text-white/80 text-xs mt-4 px-4 text-center">{lightboxImage.name}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
