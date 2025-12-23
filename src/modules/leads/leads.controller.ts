import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, Ip } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    create(@Body() createLeadDto: CreateLeadDto, @GetUser() user?: any, @Ip() ip?: string) {
        return this.leadsService.create(createLeadDto, user?.id, ip);
    }

    @Get('stats')
    getStats(@Query('source') source?: string) {
        return this.leadsService.getStats(source);
    }

    @Get('source-stats')
    getLeadSourceStats() {
        return this.leadsService.getLeadSourceStats();
    }


    @Get()
    findAll() {
        return this.leadsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Patch(':id/responsible')
    updateResponsible(
        @Param('id') id: string,
        @Body('agentId') agentId: string,
        @GetUser() user?: any,
        @Ip() ip?: string
    ) {
        return this.leadsService.updateResponsible(id, agentId, user?.id, ip);
    }
}

