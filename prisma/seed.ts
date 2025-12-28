import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Start seeding...')

    const adminEmail = 'admin@example.com'
    const password = 'password123'
    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            role: 'ADMIN' // Ensure role is ADMIN
        },
        create: {
            email: adminEmail,
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN'
        }
    })

    console.log(`Created/Updated Admin: ${admin.email}`)

    // Seed Categories
    const webCat = await prisma.category.upsert({
        where: { slug: 'web-development' },
        update: {},
        create: { name: 'Web Development', slug: 'web-development', color: '#3b82f6' }
    })

    // Seed Project
    await prisma.project.create({
        data: {
            title: 'PortX Prototype',
            description: 'The first prototype of Portfw.',
            shortDescription: 'Portfolio Website',
            technologies: ['Next.js', 'Prisma', 'Tailwind'],
            categoryId: webCat.id,
            featured: true
        }
    })

    console.log('✅ Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
