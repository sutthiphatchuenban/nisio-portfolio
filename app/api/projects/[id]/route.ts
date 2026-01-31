import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: { category: true }
        })

        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 })
        }

        await prisma.project.update({
            where: { id: params.id },
            data: { viewCount: { increment: 1 } }
        })

        let relatedProjects: any[] = []
        if (project.categoryId) {
            relatedProjects = await prisma.project.findMany({
                where: {
                    categoryId: project.categoryId,
                    id: { not: project.id }
                },
                take: 3
            })
        }

        return NextResponse.json({
            project,
            relatedProjects
        })
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
    }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const project = await prisma.project.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                shortDescription: body.shortDescription,
                imageUrl: body.imageUrl,
                images: body.images || [],
                projectUrl: body.projectUrl,
                githubUrl: body.githubUrl,
                technologies: body.technologies,
                categoryId: body.categoryId,
                featured: body.featured,
                status: body.status
            },
            include: { category: true }
        })

        return NextResponse.json({
            project,
            message: 'Project updated successfully'
        })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to update project' }, { status: 500 })
    }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await prisma.project.delete({
            where: { id: params.id }
        })

        return NextResponse.json({
            message: 'Project deleted successfully'
        })
    } catch (error) {
        return NextResponse.json({ message: 'Failed to delete project' }, { status: 500 })
    }
}
