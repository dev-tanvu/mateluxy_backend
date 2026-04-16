import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgentMeetingDto } from './dto/create-agent-meeting.dto';
import { UpdateAgentMeetingDto } from './dto/update-agent-meeting.dto';

@Injectable()
export class AgentMeetingsService {
    constructor(private prisma: PrismaService) {}

    async create(dto: CreateAgentMeetingDto, createdById?: string) {
        return this.prisma.agentMeeting.create({
            data: {
                title: dto.title,
                subtitle: dto.subtitle,
                description: dto.description,
                meetingLink: dto.meetingLink,
                meetingDate: new Date(dto.meetingDate),
                startTime: dto.startTime,
                endTime: dto.endTime,
                priority: dto.priority || 'NORMAL',
                targetType: dto.targetType || 'ALL',
                targetAgentIds: dto.targetAgentIds || [],
                createdById,
            },
        });
    }

    async findAll(filters?: { status?: string; from?: string; to?: string }) {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.from || filters?.to) {
            where.meetingDate = {};
            if (filters.from) where.meetingDate.gte = new Date(filters.from);
            if (filters.to) where.meetingDate.lte = new Date(filters.to);
        }

        return this.prisma.agentMeeting.findMany({
            where,
            orderBy: { meetingDate: 'desc' },
        });
    }

    async findOne(id: string) {
        const meeting = await this.prisma.agentMeeting.findUnique({ where: { id } });
        if (!meeting) throw new NotFoundException(`Meeting with ID ${id} not found`);
        return meeting;
    }

    async findForAgent(agentId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.agentMeeting.findMany({
            where: {
                status: { not: 'CANCELLED' },
                meetingDate: { gte: today },
                OR: [
                    { targetType: 'ALL' },
                    { targetAgentIds: { has: agentId } },
                ],
            },
            orderBy: { meetingDate: 'asc' },
        });
    }

    async update(id: string, dto: UpdateAgentMeetingDto) {
        await this.findOne(id);

        const data: any = { ...dto };
        if (dto.meetingDate) {
            data.meetingDate = new Date(dto.meetingDate);
        }

        return this.prisma.agentMeeting.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.agentMeeting.delete({ where: { id } });
    }
}
