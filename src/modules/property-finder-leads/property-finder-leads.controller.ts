import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { PropertyFinderLeadsService } from './property-finder-leads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('property-finder-leads')
@UseGuards(JwtAuthGuard)
export class PropertyFinderLeadsController {
    constructor(private readonly leadsService: PropertyFinderLeadsService) { }

    @Get()
    findAll(@Query('listingReference') listingReference?: string) {
        return this.leadsService.findAll(listingReference);
    }

    @Get('stats')
    getStats() {
        return this.leadsService.getStats();
    }
}
