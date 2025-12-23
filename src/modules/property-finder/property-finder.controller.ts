import { Controller, Post, UseGuards } from '@nestjs/common';
import { PropertyFinderService } from './property-finder.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('property-finder')
@UseGuards(JwtAuthGuard)
export class PropertyFinderController {
    constructor(private readonly propertyFinderService: PropertyFinderService) { }

    @Post('sync-leads')
    async syncLeads() {
        return this.propertyFinderService.syncLeads();
    }
}
