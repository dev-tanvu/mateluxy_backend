
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst();
    if (!user) {
        console.log('No user found to attach activity to.');
        return;
    }

    await prisma.activityLog.createMany({
        data: [
            {
                userId: user.id,
                action: 'Added new Off Plan Property',
                ipAddress: '192.168.0.101',
                location: 'Dhaka, Bangladesh',
                createdAt: new Date('2025-09-06T14:45:00'),
            },
            {
                userId: user.id,
                action: 'Added new Off Plan Property',
                ipAddress: '192.168.0.101',
                location: 'Dhaka, Bangladesh',
                createdAt: new Date('2025-09-06T14:45:00'),
            },
            {
                userId: user.id,
                action: 'Added new Off Plan Property',
                ipAddress: '192.168.0.101',
                location: 'Dhaka, Bangladesh',
                createdAt: new Date('2025-09-06T14:45:00'),
            },
            {
                userId: user.id,
                action: 'Added new Off Plan Property',
                ipAddress: '192.168.0.101',
                location: 'Dhaka, Bangladesh',
                createdAt: new Date('2025-09-06T14:45:00'),
            },
            {
                userId: user.id,
                action: 'Added new Off Plan Property',
                ipAddress: '192.168.0.101',
                location: 'Dhaka, Bangladesh',
                createdAt: new Date('2025-09-06T14:45:00'),
            },
        ],
    });
    console.log('Seeded Activity Logs');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
