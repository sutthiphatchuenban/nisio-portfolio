"use client"

import { useState, useEffect } from "react"
import { AdminPageHeader, AdminSearch, AdminFilter, AdminSummary, AdminEmpty } from "@/components/admin/AdminPage"
import axios from "axios"
import { toast } from "sonner"
import { Trash2, Loader2, Eye, MailOpen, Mail } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Contact } from "@/types"

export default function AdminMessagesPage() {
    const [messages, setMessages] = useState<Contact[]>([])
    const [query, setQuery] = useState("")
    const [filter, setFilter] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null)

    useEffect(() => {
        fetchMessages()
    }, [])

    const fetchMessages = async () => {
        try {
            const res = await axios.get("/api/contact?limit=100")
            setMessages(res.data.contacts)
        } catch (error) {
            toast.error("Failed to fetch messages")
        } finally {
            setIsLoading(false)
        }
    }

    const handleView = async (msg: Contact) => {
        setSelectedMessage(msg)
        if (msg.status === 'pending') {
            try {
                await axios.patch(`/api/contact/${msg.id}`, { status: 'read' })
                setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: 'read' } : m))
            } catch (e) {
                console.error(e)
            }
        }
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm("Delete this message?")) return
        try {
            await axios.delete(`/api/contact/${id}`)
            toast.success("Message deleted")
            setMessages(prev => prev.filter(m => m.id !== id))
            if (selectedMessage?.id === id) setSelectedMessage(null)
        } catch (error) {
            toast.error("Failed to delete message")
        }
    }

    const unread = messages.filter(message => message.status === "pending").length
    const filteredMessages = messages.filter(message => [message.name, message.email, message.subject, message.message].join(" ").toLowerCase().includes(query.trim().toLowerCase()) && (filter === "all" || (filter === "unread" ? message.status === "pending" : message.status !== "pending")))

    return (
        <div className="space-y-6">
            <AdminPageHeader eyebrow="Messages" title="กล่องข้อความ" description="ติดตามการติดต่อจากผู้เข้าชมเว็บไซต์และข้อความที่ยังรออ่าน" />
            <AdminSummary items={[{label:"ข้อความทั้งหมด",value:messages.length,icon:Mail},{label:"ยังไม่ได้อ่าน",value:unread,icon:Eye},{label:"อ่านแล้ว",value:messages.length-unread,icon:MailOpen}]} />
            <div className="admin-toolbar"><AdminSearch value={query} onChange={setQuery} placeholder="ค้นหาชื่อ อีเมล หรือข้อความ…" /><AdminFilter value={filter} onChange={setFilter} options={[{value:"all",label:"ทั้งหมด",count:messages.length},{value:"unread",label:"ยังไม่อ่าน",count:unread},{value:"read",label:"อ่านแล้ว",count:messages.length-unread}]} /></div>
            <p className="text-xs text-muted-foreground">แสดง {filteredMessages.length} จาก {messages.length} ข้อความ · เปิดข้อความเพื่อทำเครื่องหมายว่าอ่านแล้ว</p>
            <section aria-label="รายการข้อความ" className="overflow-hidden rounded-2xl border bg-card">
                {isLoading ? <div role="status" className="flex items-center justify-center gap-3 p-12 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />กำลังโหลดข้อความ…</div> : !filteredMessages.length ? <AdminEmpty icon={Mail} title={query || filter !== "all" ? "ไม่พบข้อความที่ตรงกัน" : "ยังไม่มีข้อความ"} description="ข้อความที่ส่งผ่านหน้าติดต่อจะแสดงในกล่องนี้" /> : filteredMessages.map(message => <article key={message.id} className={"group flex min-w-0 items-start gap-2 border-b p-4 last:border-0 sm:gap-4 sm:p-5 " + (message.status === "pending" ? "bg-primary/[0.035]" : "")}>
                    <button type="button" onClick={() => handleView(message)} className="flex min-w-0 flex-1 items-start gap-3 text-left sm:gap-4">
                        <span className={"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold " + (message.status === "pending" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{message.name.slice(0,1).toUpperCase()}</span>
                        <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1"><span className="flex min-w-0 items-center gap-2 text-sm font-medium">{message.name}{message.status === "pending" && <span aria-label="ยังไม่ได้อ่าน" className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}</span><time className="text-[10px] text-muted-foreground">{format(new Date(message.createdAt),"d MMM yyyy")}</time></span><span className="mt-1 block truncate text-[11px] text-muted-foreground">{message.email}</span><span className="mt-3 block truncate text-sm font-medium">{message.subject || "ไม่มีหัวข้อ"}</span><span className="mt-1 block line-clamp-2 break-words text-xs leading-6 text-muted-foreground">{message.message}</span></span>
                    </button>
                    <Button variant="ghost" size="icon" aria-label={"ลบข้อความจาก " + message.name} onClick={event => handleDelete(message.id,event)} className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </article>)}
            </section>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="admin-dialog sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject || "Message Details"}</DialogTitle>
                        <DialogDescription>
                            From: {selectedMessage?.name} ({selectedMessage?.email})
                            <br />
                            Date: {selectedMessage?.createdAt && format(new Date(selectedMessage.createdAt), 'PPpp')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-1 rounded-xl border bg-muted/25 p-5 text-sm leading-7 whitespace-pre-wrap break-words">
                        {selectedMessage?.message}
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => setSelectedMessage(null)}>ปิด</Button>
                        <Button variant="destructive" onClick={(e) => selectedMessage && handleDelete(selectedMessage.id, e as any)}>ลบข้อความ</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
