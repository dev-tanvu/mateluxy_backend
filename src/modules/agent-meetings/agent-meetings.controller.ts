import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AgentMeetingsService } from './agent-meetings.service';
import { CreateAgentMeetingDto } from './dto/create-agent-meeting.dto';
import { UpdateAgentMeetingDto } from './dto/update-agent-meeting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('agent-meetings')
export class AgentMeetingsController {
    constructor(private readonly agentMeetingsService: AgentMeetingsService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Post()
    async create(@Body() dto: CreateAgentMeetingDto, @GetUser() user?: any) {
        return this.agentMeetingsService.create(dto, user?.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Query('status') status?: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.agentMeetingsService.findAll({ status, from, to });
    }

    @Get('for-agent/:agentId')
    async findForAgent(@Param('agentId') agentId: string) {
        return this.agentMeetingsService.findForAgent(agentId);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.agentMeetingsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateAgentMeetingDto) {
        return this.agentMeetingsService.update(id, dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.agentMeetingsService.remove(id);
    }
}
