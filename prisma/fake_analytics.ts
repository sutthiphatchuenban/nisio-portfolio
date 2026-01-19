import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Adding fake analytics data...')

    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(now)
        date.setDate(now.getDate() - i)
        return date
    }).reverse()

    // Create some fake page views
    for (const day of days) {
        const viewsForDay = Math.floor(Math.random() * 20) + 5 // 5-25 views per day

        for (let i = 0; i < viewsForDay; i++) {
            const hour = Math.floor(Math.random() * 24)
            const minute = Math.floor(Math.random() * 60)
            const createdAt = new Date(day)
            createdAt.setHours(hour, minute, 0, 0)

            await prisma.analytics.create({
                data: {
                    pagePath: Math.random() > 0.5 ? '/' : '/projects',
                    pageTitle: Math.random() > 0.5 ? 'Home' : 'Projects',
                    referrer: null,
                    sessionId: `session-${Math.floor(Math.random() * 100)}`,
                    duration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    createdAt
                }
            })
        }
    }

    console.log('✅ Fake analytics data added.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })