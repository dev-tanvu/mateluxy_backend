
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    // We need the key manually since we are skipping ConfigService
    // But we can fetch it from DB integration config if needed, OR user provided key?
    // User hasn't provided key in chat. We rely on DB.

    // FETCH CREDENTIALS FROM DB
    const config = await prisma.integrationConfig.findUnique({
        where: { provider: 'property_finder' }
    });

    if (!config || !config.isEnabled) {
        console.error('PF Integration not enabled or found in DB.');
        return;
    }

    const creds = config.credentials as any;
    const apiKey = creds.apiKey; // Check your DB structure for exact key names
    const clientSecret = creds.clientSecret; // or secretKey?

    console.log('Got credentials from DB.');

    // Manually get token
    // We assume we already have a token logic or we can try to reuse the token generation IF simple
    // Actually, let's use the valid token checking logic if we can mock it, 
    // BUT easier: just use the SERVICE via Nest if we fix the connection error.

    // The previous error "Server has closed the connection" is weird.
    // Let's try the Nest approach again but with proper shutdown hooks?
    // Or maybe just pure AXIOS if we can get the token.

    // For now, let's fallback to the token generation endpoint logic manually:
    // POST https://atlas.propertyfinder.com/oauth/token
    // client_id, client_secret, grant_type=client_credentials, scope=visual_search

    console.log('Fetching Access Token...');
    // Note: Assuming standard OAuth2 client credentials flow
    // We might need the exact URL from env or service.

    // WAIT: I don't know the client_id/secret without reading them from DB.
    // And I cannot read them easily if DB fails.
    // But the DB read failed in previous step?
    // "Server has closed the connection" -> Postgres closed it? Or Nest app closed?

    // Let's try the SIMPLEST DB query first.
    const user = await prisma.user.findFirst();
    console.log('DB Connection Test: ' + (user ? 'Success' : 'Fail'));

    // If that works, then fetch config.
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
