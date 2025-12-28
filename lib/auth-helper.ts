import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import jwt from "jsonwebtoken"
import prisma from "@/lib/prisma"

const SECRET = process.env.NEXTAUTH_SECRET || "supersecretShouldBeInEnv"

export interface AuthResult {
    isAuthorized: boolean
    user?: {
        id: string
        role: string
    }
}

export async function authorizeAdmin(request: Request): Promise<AuthResult> {
    // 1. Try NextAuth Session (Cookies)
    const session = await getServerSession(authOptions)
    if (session?.user?.role === 'ADMIN') {
        return { isAuthorized: true, user: session.user }
    }

    // 2. Try Authorization Header (Bearer Token)
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1]
        try {
            const decoded = jwt.verify(token, SECRET) as any
            // Verify role in token or fetch from DB to be checking current status
            // For speed, check token role. For security, check DB.
            // Let's check DB to be safe (revocation support).
            const user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, role: true }
            })

            if (user?.role === 'ADMIN') {
                return { isAuthorized: true, user }
            }
        } catch (error) {
            // Token invalid or expired
        }
    }

    return { isAuthorized: false }
}
