import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const [
            totalVisits,
            uniqueVisitorsGroup,
            avgDurationAgg,
            topPagesGroup,
            projectCount,
            messageCount,
            recentMessages,
            recentProjects,
            dailyStatsRaw
        ] = await prisma.$transaction([
            prisma.analytics.count(),
            prisma.analytics.groupBy({ by: ['sessionId'], _count: { sessionId: true }, orderBy: { sessionId: 'asc' } }),
            prisma.analytics.aggregate({ _avg: { duration: true } }),
            prisma.analytics.groupBy({
                by: ['pagePath'],
                _count: { pagePath: true },
                orderBy: { _count: { pagePath: 'desc' } },
                take: 5
            }),
            prisma.project.count(),
            prisma.contact.count({ where: { status: 'pending' } }),
            prisma.contact.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.project.findMany({
                take: 5,
                orderBy: { updatedAt: 'desc' },
                select: { id: true, title: true, status: true, updatedAt: true }
            }),
            prisma.$queryRaw`
                SELECT DATE(created_at) as date, COUNT(*) as views 
                FROM analytics 
                WHERE created_at > NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY DATE(created_at) ASC
            `
        ])

        const uniqueVisitors = uniqueVisitorsGroup.length
        const avgSessionDuration = avgDurationAgg._avg.duration || 0

        // Bounce Rate handling
        const singlePageSessions = uniqueVisitorsGroup.filter((s: any) => s._count.sessionId === 1).length
        const bounceRate = uniqueVisitors > 0 ? (singlePageSessions / uniqueVisitors) * 100 : 0

        const topPages = topPagesGroup.map((p: any) => ({
            path: p.pagePath,
            views: p._count.pagePath
        }))

        // Verify dailyStatsRaw structure (Postgres returns array of objects)
        const dailyStats = Array.isArray(dailyStatsRaw)
            ? dailyStatsRaw.map((d: any) => ({
                date: new Date(d.date).toISOString().split('T')[0],
                views: Number(d.views)
            }))
            : []

        return NextResponse.json({
            stats: {
                totalVisits,
                uniqueVisitors,
                avgSessionDuration,
                bounceRate,
                projectCount,
                unreadMessages: messageCount
            },
            topPages,
            recentMessages,
            recentProjects,
            dailyStats
        })

    } catch (error) {
        console.error("Analytics Error:", error)
        return NextResponse.json({ message: 'Failed to fetch analytics' }, { status: 500 })
    }
}
