import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'nisio@portx.com'
    const password = '21704nisio'
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create or Update 'nisio' user
    const admin = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            name: 'Nisio Admin'
        },
        create: {
            email,
            name: 'Nisio Admin',
            password: hashedPassword,
            role: 'ADMIN'
        }
    })

    console.log(`✅ Admin updated: ${admin.email}`)
    console.log(`🔑 Password set to: ${password}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
