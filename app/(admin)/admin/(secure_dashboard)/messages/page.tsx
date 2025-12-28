"use client"

import { useState, useEffect } from "react"
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            </div>

            <div className="rounded-md border bg-white dark:bg-black p-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin inline" /> Loading...
                                </TableCell>
                            </TableRow>
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">No messages.</TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
                                <TableRow
                                    key={msg.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => handleView(msg)}
                                >
                                    <TableCell className="whitespace-nowrap text-muted-foreground w-[150px]">
                                        {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{msg.name}</div>
                                        <div className="text-xs text-muted-foreground">{msg.email}</div>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate">
                                        {msg.subject || "(No Subject)"}
                                    </TableCell>
                                    <TableCell>
                                        {msg.status === 'pending' ? (
                                            <Badge variant="default" className="bg-blue-500">Unread</Badge>
                                        ) : (
                                            <Badge variant="secondary">Read</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => handleDelete(msg.id, e)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject || "Message Details"}</DialogTitle>
                        <DialogDescription>
                            From: {selectedMessage?.name} ({selectedMessage?.email})
                            <br />
                            Date: {selectedMessage?.createdAt && format(new Date(selectedMessage.createdAt), 'PPpp')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 p-4 rounded-md bg-muted text-sm whitespace-pre-wrap leading-relaxed">
                        {selectedMessage?.message}
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setSelectedMessage(null)}>Close</Button>
                        <Button variant="destructive" onClick={(e) => selectedMessage && handleDelete(selectedMessage.id, e as any)}>Delete</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
