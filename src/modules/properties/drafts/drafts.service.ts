
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class DraftsService {
    constructor(private prisma: PrismaService) { }

    async createOrUpdate(data: any, userId: string) {
        // If the draft has an ID (we are updating a draft), update it.
        // If it sends 'id' but it's not found, maybe create new?
        // Usually frontend sends 'id' if it knows it.

        const { id, originalPropertyId, ...draftData } = data;

        if (id) {
            // Check if exists
            const existing = await this.prisma.propertyDraft.findUnique({ where: { id } });
            if (existing) {
                return this.prisma.propertyDraft.update({
                    where: { id },
                    data: {
                        data: draftData,
                        updatedAt: new Date(),
                        // originalPropertyId might change if we started fresh but then linked it? Unlikely.
                    }
                });
            }
        }

        // Create new
        return this.prisma.propertyDraft.create({
            data: {
                userId,
                originalPropertyId: originalPropertyId || null,
                data: draftData
            }
        });
    }

    async findAll(userId: string | null) {
        // Just return all drafts for now, maybe filter by user if userId provided
        // The schema has userId as string?

        let where: any = {};
        if (userId) {
            where.userId = userId;
        }

        return this.prisma.propertyDraft.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        });
    }

    async findOne(id: string) {
        const draft = await this.prisma.propertyDraft.findUnique({
            where: { id }
        });
        if (!draft) throw new NotFoundException('Draft not found');
        return draft;
    }

    async delete(id: string) {
        return this.prisma.propertyDraft.delete({
            where: { id }
        });
    }
}
