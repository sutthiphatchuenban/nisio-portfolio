import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const DEFAULT_SETTINGS_ID = 'default'

export async function GET() {
    const defaultData = {
        id: DEFAULT_SETTINGS_ID,
        siteName: 'PORTX',
        siteDescription: 'Personal portfolio website',
        name: 'Sutthiphat Chuenban',
        title: 'Full Stack Developer',
        bio: 'I am a passionate developer creating modern web applications.',
        email: 'sutthiphatchuenban@gmail.com',
        location: 'Thailand',
        avatar: null,
        heroImage: null,
        heroImageMobile: null,
        resumeUrl: null,
        githubUrl: null,
        linkedinUrl: null,
        twitterUrl: null,
        updatedAt: new Date(),
    }

    try {
        const fetchPromise = prisma.siteSettings.findUnique({
            where: { id: DEFAULT_SETTINGS_ID }
        })
        const settings: any = await Promise.race([
            fetchPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500))
        ])

        if (settings) {
            return NextResponse.json(settings)
        }

        return NextResponse.json(defaultData)
    } catch (error) {
        return NextResponse.json(defaultData)
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()

        const settings = await prisma.siteSettings.upsert({
            where: { id: DEFAULT_SETTINGS_ID },
            update: {
                siteName: body.siteName,
                siteDescription: body.siteDescription,
                name: body.name,
                title: body.title,
                bio: body.bio,
                avatar: body.avatar,
                heroImage: body.heroImage,
                heroImageMobile: body.heroImageMobile,
                email: body.email,
                location: body.location,
                resumeUrl: body.resumeUrl,
                githubUrl: body.githubUrl,
                linkedinUrl: body.linkedinUrl,
                twitterUrl: body.twitterUrl,
            },
            create: {
                id: DEFAULT_SETTINGS_ID,
                siteName: body.siteName,
                siteDescription: body.siteDescription,
                name: body.name,
                title: body.title,
                bio: body.bio,
                avatar: body.avatar,
                heroImage: body.heroImage,
                heroImageMobile: body.heroImageMobile,
                email: body.email,
                location: body.location,
                resumeUrl: body.resumeUrl,
                githubUrl: body.githubUrl,
                linkedinUrl: body.linkedinUrl,
                twitterUrl: body.twitterUrl,
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error(error)
        return NextResponse.json({ message: 'Failed to update settings' }, { status: 500 })
    }
}
