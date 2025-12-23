
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const reference = 'REF-U1ZGPQNC';
    console.log(`Searching for property with reference: ${reference}`);

    const property = await prisma.property.findFirst({
        where: { reference: reference },
        include: { assignedAgent: true }
    });

    if (!property) {
        console.log('Property NOT FOUND in CRM database.');
    } else {
        console.log('--- PROPERTY FOUND ---');
        console.log(`ID: ${property.id}`);
        console.log(`Title: ${property.propertyTitle}`);
        console.log(`PF Listing ID: ${property.pfListingId}`);
        console.log(`PF Synced At: ${property.pfSyncedAt}`);
        console.log(`PF Verification Status: ${property.pfVerificationStatus}`);
        console.log(`Assigned Agent PF Profile ID: ${property.assignedAgent?.pfPublicProfileId}`);
        console.log('----------------------');

        if (property.pfListingId) {
            console.log('✅ Property HAS been synced (Listing ID present).');
        } else {
            console.log('❌ Property has NOT been synced (No Listing ID).');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
