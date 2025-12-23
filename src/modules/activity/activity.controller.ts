import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { Prisma } from '@prisma/client';

@Controller('activity-logs')
export class ActivityController {
    constructor(private readonly activityService: ActivityService) { }

    @Post()
    create(@Body() createActivityDto: Prisma.ActivityLogCreateInput) {
        return this.activityService.create(createActivityDto);
    }

    @Get()
    findAll(
        @Query('skip') skip?: string,
        @Query('take') take?: string,
        @Query('search') search?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const where: Prisma.ActivityLogWhereInput = {
            AND: [
                search ? {
                    OR: [
                        { action: { contains: search, mode: 'insensitive' } },
                        { user: { fullName: { contains: search, mode: 'insensitive' } } },
                        { user: { email: { contains: search, mode: 'insensitive' } } },
                    ],
                } : {},
                startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                } : {}
            ]
        };

        return this.activityService.findAll({
            skip: skip ? Number(skip) : undefined,
            take: take ? Number(take) : undefined,
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
