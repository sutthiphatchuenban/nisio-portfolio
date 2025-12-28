import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const SECRET = process.env.NEXTAUTH_SECRET || "supersecretShouldBeInEnv"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, rememberMe } = body

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Email and password are required' },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || !user.password) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Generate Access Token
        // 'expiresIn' in jwt.sign needs string (e.g. '1d') or number (seconds)
        const expiresInStr = rememberMe ? '30d' : '1d'
        const expiresInSeconds = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60

        const accessToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            SECRET,
            { expiresIn: expiresInStr }
        )

        const userPayload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        }

        return NextResponse.json({
            user: userPayload,
            accessToken,
            expiresIn: expiresInSeconds
        })

    } catch (error) {
        console.error('Signin error:', error)
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        )
    }
}
