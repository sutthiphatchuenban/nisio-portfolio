import { NextApiRequest } from "next"

export default async function broadcastHandler(req: NextApiRequest, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: "Method not allowed" })
    }

    const { event, data } = req.body
    const authHeader = req.headers.authorization

    // Simple security check (internal use only)
    // In production, use a shared secret from ENV
    if (authHeader !== `Bearer ${process.env.NEXTAUTH_SECRET}`) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    if (res.socket?.server?.io) {
        res.socket.server.io.emit(event, data)
        return res.status(200).json({ message: "Event broadcasted" })
    } else {
        return res.status(500).json({ message: "Socket server not running" })
    }
}
