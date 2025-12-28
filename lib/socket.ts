import { NextApiRequest } from "next"

export const PagesApiResponse = (res: any) => {
    if (res.socket?.server?.io) {
        return res.socket.server.io
    }
    return null
}
