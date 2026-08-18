import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/admin/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const inputEmail = credentials.email.toLowerCase().trim()
                const inputPassword = credentials.password.trim()

                // 1. Primary Admin Credentials Check (read from environment, never hardcoded)
                const primaryEmail = (process.env.ADMIN_PRIMARY_EMAIL || "").toLowerCase().trim()
                const primaryPassword = process.env.ADMIN_PRIMARY_PASSWORD || ""
                if (primaryEmail && primaryPassword) {
                    if (inputEmail === primaryEmail && inputPassword === primaryPassword) {
                        return {
                            id: "admin_sutthiphat",
                            name: "Sutthiphat Chuenban",
                            email: primaryEmail,
                            image: null,
                            role: "ADMIN",
                        }
                    }
                }

                // 2. Try checking Database with timeout protection
                try {
                    const dbPromise = prisma.user.findUnique({
                        where: { email: inputEmail }
                    })
                    const user: any = await Promise.race([
                        dbPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500))
                    ])

                    if (user && user.password) {
                        const isValid = await bcrypt.compare(inputPassword, user.password)
                        if (isValid) {
                            return {
                                id: user.id,
                                name: user.name || 'Admin User',
                                email: user.email,
                                image: user.avatar,
                                role: user.role || 'ADMIN',
                            }
                        }
                    }
                } catch (error) {
                    console.warn("Database query failed during auth, evaluating fallback credentials:", error)
                }

                // 3. Environment Admin Credentials Check (only if configured)
                const envEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim()
                const envPassword = process.env.ADMIN_PASSWORD || ""

                if (envEmail && envPassword && inputEmail === envEmail && inputPassword === envPassword) {
                    return {
                        id: "admin_master_id",
                        name: "Admin User",
                        email: envEmail,
                        image: null,
                        role: "ADMIN",
                    }
                }

                return null
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role || "ADMIN"
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role || "ADMIN"
                ;(session.user as any).id = token.id
            }
            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "supersecretShouldBeInEnv",
}
