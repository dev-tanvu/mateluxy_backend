
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { PropertyFinderService } from '../src/modules/property-finder/property-finder.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

async function main() {
    const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
    const pfService = app.get(PropertyFinderService);
    const httpService = app.get(HttpService);

    const reference = 'REF-U1ZGPQNC';
    console.log(`Checking PF Status for Reference: ${reference} with Explicit Filters...`);

    try {
        const token = await pfService.getAccessToken();
        const url = 'https://atlas.propertyfinder.com/v1/listings';

        // Try states: live (default), draft, archived
        // We can't query multiple states at once easily via array usually in query params unless supported
        // But let's try strict queries
        const states = ['live', 'draft', 'archived', 'rejected', 'pending'];

        for (const state of states) {
            console.log(`Querying state: ${state} ...`);
            try {
                const response = await firstValueFrom(
                    httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` },
                        params: {
                            'filter[reference]': reference,
                            'filter[state]': state,
                            'perPage': 5
                        }
                    })
                );
                const data = response.data;
                const results = data.results || data.data || [];

                if (results.length > 0) {
                    console.log(`✅ FOUND in state: ${state}`);
                    const listing = results[0];
                    console.log(`ID: ${listing.id}`);
                    console.log(`Ref: ${listing.reference}`);
                    console.log(`State Type: ${listing.state?.type}`);
                    console.log(`State Stage: ${listing.state?.stage}`);
                    console.log(`Verification Status: ${listing.verificationStatus || 'N/A'}`);
                    if (listing.state?.reasons) {
                        console.log('REJECTION REASONS:');
                        console.log(JSON.stringify(listing.state.reasons, null, 2));
                    } else {
                        console.log('No specific reasons listed.');
                    }
                    break; // Found it
                } else {
                    console.log(`Not found in ${state}.`);
                }
            } catch (innerErr) {
                // Some states might be invalid enum values and throw 400
                console.log(`Error querying state ${state}: ${innerErr.message}`);
            }
        }

    } catch (e) {
        console.error('API Error:', e.message);
    } finally {
        await app.close();
    }
}

main();
