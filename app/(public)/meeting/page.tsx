"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    MessageSquare,
    Users,
    Lock,
    Unlock,
    Sparkles,
    Shield,
    FileText,
    ArrowRight,
    Plus,
    LogIn,
    History,
    Check,
    Copy,
    Zap,
    Crown,
    KeyRound,
    Radio,
    X,
} from "lucide-react"

const AVATAR_COLORS = [
    { name: "Blue", bg: "#3B82F6", class: "bg-blue-500" },
    { name: "Purple", bg: "#8B5CF6", class: "bg-purple-500" },
    { name: "Emerald", bg: "#10B981", class: "bg-emerald-500" },
    { name: "Rose", bg: "#F43F5E", class: "bg-rose-500" },
    { name: "Amber", bg: "#F59E0B", class: "bg-amber-500" },
    { name: "Cyan", bg: "#06B6D4", class: "bg-cyan-500" },
    { name: "Indigo", bg: "#6366F1", class: "bg-indigo-500" },
    { name: "Fuchsia", bg: "#D946EF", class: "bg-fuchsia-500" },
]

interface RecentRoom {
    code: string
    name: string
    hostName: string
    visitedAt: number
}

function MeetingHubContent() {
    const router = useRouter()
    const { data: session } = useSession()
    const isAdmin = session?.user?.role === "ADMIN"

    const searchParams = useSearchParams()
    const queryRoom = searchParams ? searchParams.get("room") || "" : ""

    const [tab, setTab] = useState<"create" | "join">(queryRoom || !isAdmin ? "join" : "create")
    const [isLoading, setIsLoading] = useState(false)

    // Create Room State
    const [createName, setCreateName] = useState("")
    const [createHostName, setCreateHostName] = useState(session?.user?.name || "")
    const [createPasscode, setCreatePasscode] = useState("")
    const [createHasPasscode, setCreateHasPasscode] = useState(false)
    const [createColor, setCreateColor] = useState(AVATAR_COLORS[0].bg)

    // Join Room State
    const [joinCode, setJoinCode] = useState(queryRoom)
    const [joinName, setJoinName] = useState("")
    const [joinPasscode, setJoinPasscode] = useState("")
    const [joinColor, setJoinColor] = useState(AVATAR_COLORS[2].bg)

    // Recent Rooms
    const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([])

    // Active (unclosed) room auto-enter for admin
    const [activeRoom, setActiveRoom] = useState<{ code: string; name: string; hasPasscode: boolean; hostName: string } | null>(null)
    const [activeRoomDismissed, setActiveRoomDismissed] = useState(false)
    const [enterCountdown, setEnterCountdown] = useState(5)

    const enterActiveRoom = () => {
        if (!activeRoom) return
        const name = session?.user?.name || activeRoom.hostName || "Admin"
        const savedColor = localStorage.getItem("portx_meeting_user_color") || AVATAR_COLORS[0].bg
        sessionStorage.setItem(
            `meeting_auth_${activeRoom.code}`,
            JSON.stringify({
                name,
                color: savedColor,
                isHost: name === activeRoom.hostName,
                passcode: "",
            })
        )
        saveRecentRoom({
            code: activeRoom.code,
            name: activeRoom.name,
            hostName: activeRoom.hostName,
        })
        router.push(`/meeting/${activeRoom.code}`)
    }

    // Fetch latest unclosed room for admin
    useEffect(() => {
        if (!isAdmin) return
        let cancelled = false
        fetch("/api/meeting/room/active")
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled && data?.success && data.room) {
                    setActiveRoom(data.room)
                }
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [isAdmin])

    // Auto-enter countdown (5s) unless dismissed
    useEffect(() => {
        if (!activeRoom || activeRoomDismissed) return
        if (enterCountdown <= 0) {
            enterActiveRoom()
            return
        }
        const t = setTimeout(() => setEnterCountdown((c) => c - 1), 1000)
        return () => clearTimeout(t)
    }, [activeRoom, activeRoomDismissed, enterCountdown])

    useEffect(() => {
        if (session?.user?.name && !createHostName) {
            setCreateHostName(session.user.name)
        }
    }, [session])

    useEffect(() => {
        if (queryRoom) {
            setJoinCode(queryRoom)
            setTab("join")
        }

        // Load saved name and color preference
        const savedName = localStorage.getItem("portx_meeting_user_name")
        const savedColor = localStorage.getItem("portx_meeting_user_color")
        if (savedName && !joinName) {
            setJoinName(savedName)
        }
        if (savedColor) {
            setCreateColor(savedColor)
            setJoinColor(savedColor)
        }

        // Load recent rooms
        try {
            const savedRooms = localStorage.getItem("portx_recent_meetings")
            if (savedRooms) {
                setRecentRooms(JSON.parse(savedRooms))
            }
        } catch {}
    }, [queryRoom])

    const saveRecentRoom = (room: { code: string; name: string; hostName: string }) => {
        try {
            const current: RecentRoom[] = JSON.parse(localStorage.getItem("portx_recent_meetings") || "[]")
            const filtered = current.filter((r) => r.code.toLowerCase() !== room.code.toLowerCase())
            const updated = [
                { code: room.code, name: room.name, hostName: room.hostName, visitedAt: Date.now() },
                ...filtered,
            ].slice(0, 5)
            localStorage.setItem("portx_recent_meetings", JSON.stringify(updated))
            setRecentRooms(updated)
        } catch {}
    }

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!isAdmin) {
            toast.error("เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถสร้างห้องประชุมได้")
            return
        }

        const host = createHostName.trim() || session?.user?.name || "Admin"

        setIsLoading(true)
        try {
            const res = await fetch("/api/meeting/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    name: createName.trim() || "ห้องประชุม (Admin Meeting)",
                    hostName: host,
                    hostColor: createColor,
                    passcode: createHasPasscode ? createPasscode.trim() : undefined,
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "Failed to create room")
            }

            // Save user profile for this meeting
            localStorage.setItem("portx_meeting_user_name", host)
            localStorage.setItem("portx_meeting_user_color", createColor)
            sessionStorage.setItem(
                `meeting_auth_${data.room.code}`,
                JSON.stringify({
                    name: host,
                    color: createColor,
                    isHost: true,
                    passcode: createHasPasscode ? createPasscode.trim() : "",
                })
            )

            saveRecentRoom({
                code: data.room.code,
                name: data.room.name,
                hostName: data.room.hostName,
            })

            toast.success("สร้างห้องประชุมสำเร็จ!")
            router.push(`/meeting/${data.room.code}`)
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการสร้างห้อง")
        } finally {
            setIsLoading(false)
        }
    }

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!joinCode.trim()) {
            toast.error("กรุณากรอกรหัสห้องประชุม (Room Code)")
            return
        }
        if (!joinName.trim()) {
            toast.error("กรุณากรอกชื่อของคุณก่อนเข้าร่วมห้อง")
            return
        }

        setIsLoading(true)
        try {
            const cleanCode = joinCode.trim().toLowerCase()
            const res = await fetch("/api/meeting/room", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "join",
                    code: cleanCode,
                    name: joinName.trim(),
                    color: joinColor,
                    passcode: joinPasscode.trim(),
                }),
            })

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "ไม่สามารถเข้าร่วมห้องได้")
            }

            // Save user profile
            localStorage.setItem("portx_meeting_user_name", joinName.trim())
            localStorage.setItem("portx_meeting_user_color", joinColor)
            sessionStorage.setItem(
                `meeting_auth_${data.room.code}`,
                JSON.stringify({
                    name: joinName.trim(),
                    color: joinColor,
                    isHost: joinName.trim() === data.room.hostName,
                    passcode: joinPasscode.trim(),
                })
            )

            saveRecentRoom({
                code: data.room.code,
                name: data.room.name,
                hostName: data.room.hostName,
            })

            toast.success(`เข้าร่วมห้อง "${data.room.name}" สำเร็จ`)
            router.push(`/meeting/${data.room.code}`)
        } catch (error: any) {
            toast.error(error.message || "เกิดข้อผิดพลาดในการเข้าร่วมห้อง")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-background via-background/90 to-muted/30 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Active Room Auto-Enter Banner (Admin) */}
                {isAdmin && activeRoom && !activeRoomDismissed && (
                    <div className="relative p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent overflow-hidden">
                        <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl" />
                        <button
                            type="button"
                            onClick={() => setActiveRoomDismissed(true)}
                            className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-background/60 transition-colors"
                            title="อยู่ที่หน้านี้ต่อไป"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <div className="relative flex h-3 w-3 shrink-0 mt-1.5 sm:mt-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                                    <span className="flex items-center gap-1.5">
                                        <Radio className="w-4 h-4 text-emerald-500" />
                                        มีห้องประชุมที่ยังไม่ปิด: {activeRoom.name}
                                    </span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    #{activeRoom.code} • สร้างโดย {activeRoom.hostName}
                                    {activeRoom.hasPasscode && <span className="ml-2 inline-flex items-center gap-1"><Lock className="w-3 h-3 text-amber-500" />มีรหัสผ่าน</span>}
                                    <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-medium">
                                        เข้าห้องอัตโนมัติใน {enterCountdown} วิ
                                    </span>
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveRoomDismissed(true)}
                                    className="text-xs"
                                >
                                    อยู่ต่อ
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={enterActiveRoom}
                                    className="font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
                                >
                                    เข้าห้องเลย
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Header Banner */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        <Zap className="h-3.5 w-3.5 animate-pulse text-amber-500" />
                        <span>Real-time Chat & File Meeting</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
                        ห้องแชทและการประชุมออนไลน์
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base">
                        ระบบการประชุมและแชทส่งไฟล์เรียลไทม์ ปลอดภัยและสะดวกสบาย เข้าห้องด้วยรหัสหรือลิงก์เชิญได้ทันที
                    </p>
                </div>

                {/* Main Card with Tabs */}
                <Card className="border-border/60 shadow-xl backdrop-blur-sm bg-card/90 overflow-hidden">
                    {/* Tab Buttons */}
                    <div className="grid grid-cols-2 p-1.5 bg-muted/60 border-b border-border/40">
                        <button
                            type="button"
                            onClick={() => setTab("join")}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                                tab === "join"
                                    ? "bg-background text-foreground shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <LogIn className="h-4 w-4 text-emerald-500" />
                            <span>เข้าร่วมห้องด้วยรหัส</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("create")}
                            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                                tab === "create"
                                    ? "bg-background text-foreground shadow-sm font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                            }`}
                        >
                            <Plus className="h-4 w-4 text-primary" />
                            <span>สร้างห้องประชุม (Admin)</span>
                            {isAdmin && (
                                <Badge className="h-4 px-1 text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                    Admin 👑
                                </Badge>
                            )}
                        </button>
                    </div>

                    <CardContent className="p-6 sm:p-8">
                        <AnimatePresence mode="wait">
                            {tab === "create" ? (
                                isAdmin ? (
                                    /* Admin Create Room Form */
                                    <motion.form
                                        key="create-form"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        onSubmit={handleCreateRoom}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Crown className="w-4 h-4 text-amber-500" />
                                                <span>เข้าสู่ระบบในฐานะ Admin: {session.user?.name || "Admin"}</span>
                                            </div>
                                            <Badge variant="outline" className="text-[10px] border-amber-500/30">
                                                Authorized
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {/* Room Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="create-room-name" className="text-sm font-medium">
                                                    ชื่อห้องประชุม / หัวข้อ
                                                </Label>
                                                <Input
                                                    id="create-room-name"
                                                    placeholder="เช่น คุยงานโปรเจกต์, Daily Sync..."
                                                    value={createName}
                                                    onChange={(e) => setCreateName(e.target.value)}
                                                    className="bg-background/80"
                                                />
                                            </div>

                                            {/* Host Name */}
                                            <div className="space-y-2">
                                                <Label htmlFor="create-host-name" className="text-sm font-medium">
                                                    ชื่อผู้จัดประชุม (Host Name) <span className="text-destructive">*</span>
                                                </Label>
                                                <Input
                                                    id="create-host-name"
                                                    placeholder="ชื่อของคุณ"
                                                    value={createHostName}
                                                    onChange={(e) => setCreateHostName(e.target.value)}
                                                    required
                                                    className="bg-background/80"
                                                />
                                            </div>
                                        </div>

                                        {/* Color Picker */}
                                        <div className="space-y-2">
                                            <Label className="text-xs text-muted-foreground">เลือกสีประจำตัวของคุณ</Label>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                {AVATAR_COLORS.map((c) => (
                                                    <button
                                                        key={c.bg}
                                                        type="button"
                                                        onClick={() => setCreateColor(c.bg)}
                                                        style={{ backgroundColor: c.bg }}
                                                        className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                                                            createColor === c.bg
                                                                ? "ring-2 ring-offset-2 ring-primary scale-110"
                                                                : "opacity-80 hover:opacity-100 hover:scale-105"
                                                        }`}
                                                    >
                                                        {createColor === c.bg && <Check className="w-3.5 h-3.5 text-white" />}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Passcode Option */}
                                        <div className="pt-2 border-t border-border/40 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {createHasPasscode ? (
                                                        <Lock className="w-4 h-4 text-amber-500" />
                                                    ) : (
                                                        <Unlock className="w-4 h-4 text-muted-foreground" />
                                                    )}
                                                    <Label htmlFor="toggle-passcode" className="text-sm cursor-pointer">
                                                        ตั้งรหัสผ่านห้อง (Passcode Protection)
                                                    </Label>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    id="toggle-passcode"
                                                    checked={createHasPasscode}
                                                    onChange={(e) => setCreateHasPasscode(e.target.checked)}
                                                    className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                                                />
                                            </div>

                                            {createHasPasscode && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className="space-y-1.5 pt-1"
                                                >
                                                    <Input
                                                        type="password"
                                                        placeholder="กรอกรหัสผ่านห้อง (เช่น 1234 หรือ mypass)"
                                                        value={createPasscode}
                                                        onChange={(e) => setCreatePasscode(e.target.value)}
                                                        className="bg-background/80"
                                                        required={createHasPasscode}
                                                    />
                                                    <p className="text-xs text-muted-foreground">
                                                        ผู้ที่จะเข้าร่วมห้องจะต้องกรอกรหัสผ่านนี้จึงจะเข้าห้องได้
                                                    </p>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={isLoading}
                                            className="w-full text-base font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                                    กำลังสร้างห้อง...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Sparkles className="w-4 h-4" />
                                                    สร้างห้องประชุมและเริ่มคุยทันที
                                                </span>
                                            )}
                                        </Button>
                                    </motion.form>
                                ) : (
                                    /* Non-Admin Barrier Notice */
                                    <motion.div
                                        key="admin-only-barrier"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center py-8 px-4 space-y-5"
                                    >
                                        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
                                            <Shield className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2 max-w-md mx-auto">
                                            <h3 className="text-xl font-bold text-foreground">
                                                เฉพาะ Admin เท่านั้นที่สามารถสร้างห้องได้
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                ระบบเปิดให้เฉพาะผู้ดูแลระบบสร้างห้องประชุมใหม่ หากคุณเป็นผู้เข้าร่วมทั่วไป สามารถกรอกรหัสห้องในแท็บ <strong>&ldquo;เข้าร่วมห้องด้วยรหัส&rdquo;</strong> เพื่อเข้าประชุมได้ทันที
                                            </p>
                                        </div>

                                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => setTab("join")}
                                                className="w-full sm:w-auto"
                                            >
                                                ไปที่หน้าเข้าร่วมห้องประชุม
                                            </Button>
                                            <Link href="/admin/login?callbackUrl=/meeting" className="w-full sm:w-auto">
                                                <Button className="w-full sm:w-auto font-semibold gap-2">
                                                    <KeyRound className="w-4 h-4" />
                                                    เข้าสู่ระบบ Admin เพื่อสร้างห้อง
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                )
                            ) : (
                                <motion.form
                                    key="join-form"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    onSubmit={handleJoinRoom}
                                    className="space-y-5"
                                >
                                    {/* Room Code */}
                                    <div className="space-y-2">
                                        <Label htmlFor="join-room-code" className="text-sm font-medium">
                                            รหัสห้องประชุม (Room Code) <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="join-room-code"
                                                placeholder="เช่น meet-7492 หรือ sync-88a"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                                required
                                                className="bg-background/80 uppercase font-mono tracking-wider text-base"
                                            />
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="join-user-name" className="text-sm font-medium">
                                            ชื่อของคุณ (Display Name) <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="join-user-name"
                                            placeholder="กรอกชื่อที่เพื่อนๆ ในห้องจะเห็น"
                                            value={joinName}
                                            onChange={(e) => setJoinName(e.target.value)}
                                            required
                                            className="bg-background/80"
                                        />
                                    </div>

                                    {/* Passcode (Optional unless room requires) */}
                                    <div className="space-y-2">
                                        <Label htmlFor="join-passcode" className="text-sm font-medium">
                                            รหัสผ่านห้อง (ถ้ามี)
                                        </Label>
                                        <Input
                                            id="join-passcode"
                                            type="password"
                                            placeholder="กรอกรหัสผ่านกรณีห้องมี Passcode"
                                            value={joinPasscode}
                                            onChange={(e) => setJoinPasscode(e.target.value)}
                                            className="bg-background/80"
                                        />
                                    </div>

                                    {/* Color Picker */}
                                    <div className="space-y-2">
                                        <Label className="text-xs text-muted-foreground">เลือกสีประจำตัว</Label>
                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {AVATAR_COLORS.map((c) => (
                                                <button
                                                    key={c.bg}
                                                    type="button"
                                                    onClick={() => setJoinColor(c.bg)}
                                                    style={{ backgroundColor: c.bg }}
                                                    className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                                                        joinColor === c.bg
                                                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                                                            : "opacity-80 hover:opacity-100 hover:scale-105"
                                                    }`}
                                                >
                                                    {joinColor === c.bg && <Check className="w-3.5 h-3.5 text-white" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Join Button */}
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isLoading}
                                        className="w-full text-base font-semibold shadow-md bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                                กำลังตรวจสอบห้อง...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <LogIn className="w-4 h-4" />
                                                เข้าร่วมห้องประชุม
                                                <ArrowRight className="w-4 h-4 ml-1" />
                                            </span>
                                        )}
                                    </Button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Recent Rooms */}
                {recentRooms.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <History className="h-4 w-4" />
                            <span>ห้องประชุมล่าสุดที่คุณเคยเข้า</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {recentRooms.map((room) => (
                                <button
                                    key={room.code}
                                    type="button"
                                    onClick={() => {
                                        setJoinCode(room.code)
                                        setTab("join")
                                    }}
                                    className="p-3.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-primary/50 transition-all text-left group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-mono text-xs font-bold text-primary">
                                                #{room.code}
                                            </span>
                                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                        </div>
                                        <div className="font-semibold text-sm mt-1 truncate">{room.name}</div>
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-2">
                                        สร้างโดย {room.hostName}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            <Zap className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm">Real-time ไวทันใจ</h3>
                        <p className="text-xs text-muted-foreground">
                            ข้อความและแจ้งเตือนส่งถึงทุกคนทันที ไม่พลาดทุกการสนทนา รองรับการใช้งานทั้งบนมือถือและคอม
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm">ส่งรูปภาพและไฟล์</h3>
                        <p className="text-xs text-muted-foreground">
                            ลากและวางไฟล์ (Drag & Drop) หรือ Paste รูปภาพจาก Clipboard เพื่อส่งไฟล์เอกสารและรูปภาพได้สูงสุด 25MB
                        </p>
                    </div>

                    <div className="p-4 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm space-y-2">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                            <Shield className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm">ปลอดภัย & ล็อกรหัสผ่านได้</h3>
                        <p className="text-xs text-muted-foreground">
                            สามารถกำหนด Passcode สำหรับห้องส่วนตัว แชร์ลิงก์เชิญให้เฉพาะคนที่ต้องการเข้าร่วมได้อย่างปลอดภัย
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function MeetingHubPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
                    <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
                </div>
            }
        >
            <MeetingHubContent />
        </Suspense>
    )
}
