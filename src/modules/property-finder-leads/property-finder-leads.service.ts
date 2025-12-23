import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PropertyFinderLead } from '@prisma/client';

@Injectable()
export class PropertyFinderLeadsService {
    private readonly logger = new Logger(PropertyFinderLeadsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async upsert(data: any): Promise<PropertyFinderLead> {
        // @ts-ignore Generated Prisma client includes `propertyFinderLead`
        return this.prisma.propertyFinderLead.upsert({
            where: { pfId: data.pfId },
            update: data,
            create: data,
        });
    }

    async findAll(listingReference?: string) {
        // @ts-ignore Generated Prisma client includes `propertyFinderLead`
        const leads = await this.prisma.propertyFinderLead.findMany({
            where: listingReference ? {
                listingReference: listingReference,
            } : undefined,
            orderBy: { createdAt: 'desc' },
        });

        // Get all unique assignedToIdentifier values
        const assignedIds = leads
            .map(l => l.assignedToIdentifier)
            .filter((id): id is string => id !== null && id !== undefined);

        // Fetch agents that match these public profile IDs
        const agents = await this.prisma.agent.findMany({
            where: {
                pfPublicProfileId: { in: assignedIds },
            },
            select: {
                pfPublicProfileId: true,
                name: true,
                photoUrl: true,
            },
        });

        // Create a map for quick lookup
        const agentMap = new Map(agents.map(a => [a.pfPublicProfileId, a]));

        // Enrich leads with agent info
        return leads.map(lead => {
            const agent = lead.assignedToIdentifier ? agentMap.get(lead.assignedToIdentifier) : null;
            return {
                ...lead,
                agentName: agent?.name || null,
                agentImageUrl: agent?.photoUrl || null,
            };
        });
    }

    async getStats() {
        const now = new Date();
        const currentYear = now.getFullYear();
        const lastYear = currentYear - 1;
        const startOfLastYear = new Date(lastYear, 0, 1);

        // @ts-ignore Generated Prisma client includes `propertyFinderLead`
        const leads = await this.prisma.propertyFinderLead.findMany({
            where: {
                createdAt: {
                    gte: startOfLastYear,
                },
            },
            select: {
                createdAt: true,
                dealPrice: true,
            },
        });

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Initialize stats
        const stats = months.map(month => ({
            month,
            current: 0,
            last: 0,
        }));

        leads.forEach(lead => {
            const date = new Date(lead.createdAt);
            const year = date.getFullYear();
            const monthIdx = date.getMonth();
            const price = lead.dealPrice || 0;

            if (year === currentYear) {
                stats[monthIdx].current += price;
            } else if (year === lastYear) {
                stats[monthIdx].last += price;
            }
        });

        return stats;
    }
}
