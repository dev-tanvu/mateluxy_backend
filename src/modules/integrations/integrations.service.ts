
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class IntegrationsService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.integrationConfig.findMany();
    }

    async findOne(provider: string) {
        return this.prisma.integrationConfig.findUnique({
            where: { provider },
        });
    }

    async update(provider: string, data: { isEnabled?: boolean; credentials?: any }) {
        return this.prisma.integrationConfig.upsert({
            where: { provider },
            update: data,
            create: {
                provider,
                isEnabled: data.isEnabled ?? false,
                credentials: data.credentials ?? {},
            },
        });
    }

    async remove(provider: string) {
        try {
            return await this.prisma.integrationConfig.delete({
                where: { provider },
            });
        } catch (e) {
            // Ignore if not found
            return null;
        }
    }

    // Helper for other services to get credentials without needing to care about DB structure
    async getCredentials(provider: string) {
        const config = await this.findOne(provider);
        if (!config || !config.isEnabled) return null;
        return config.credentials; // Returns parsed JSON object
    }

    async getNotifications(limit = 10) {
        const prisma = this.prisma as any;
        if (!prisma.notification) return [];
        return prisma.notification.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    async markNotificationsRead() {
        const prisma = this.prisma as any;
        if (!prisma.notification) return;
        return prisma.notification.updateMany({
            where: { isRead: false },
            data: { isRead: true }
        });
    }
}
