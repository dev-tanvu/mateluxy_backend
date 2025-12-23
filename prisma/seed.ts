import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'info@mateluxy.com' },
        update: {},
        create: {
            fullName: 'Mateluxy',
            username: 'mateluxy',
            email: 'info@mateluxy.com',
            password: hashedPassword,
            role: Role.ADMIN,
            permissions: ['*'],
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
