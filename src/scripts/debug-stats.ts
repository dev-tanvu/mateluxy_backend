import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG SCRIPT START ---');

    // 1. Count all properties
    const total = await prisma.property.count();
    console.log(`Total Properties: ${total}`);

    // 2. Count active
    const active = await prisma.property.count({ where: { isActive: true } });
    console.log(`Active (isActive=true): ${active}`);

    // 3. Count available
    const available = await prisma.property.count({ where: { status: 'AVAILABLE' } });
    console.log(`Available (status='AVAILABLE'): ${available}`);

    // 4. Count both
    const activeAvailable = await prisma.property.count({
        where: { isActive: true, status: 'AVAILABLE' }
    });
    console.log(`Active AND Available: ${activeAvailable}`);

    // 5. List all properties to see what they look like
    const allProps = await prisma.property.findMany({
        select: { id: true, isActive: true, status: true, propertyTitle: true }
    });
    console.log('All Properties Dump:', JSON.stringify(allProps, null, 2));

    // 6. OffPlan
    const offPlan = await prisma.offPlanProperty.count({ where: { isActive: true } });
    console.log(`Active Off-Plan: ${offPlan}`);

    console.log('--- DEBUG SCRIPT END ---');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
