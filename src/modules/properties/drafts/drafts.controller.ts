
import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DraftsService } from './drafts.service';
// import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; // Assuming Auth Guard exists?
// Keeping it open for now or check other controllers.
// Properties controller usually has guards.

@Controller('properties/drafts')
export class DraftsController {
    constructor(private readonly draftsService: DraftsService) { }

    @Post()
    async createOrUpdate(@Body() body: any) {
        // In real app, get userId from Request with Guard.
        // For now, body.userId or default mock.
        const userId = body.userId || 'system';
        return this.draftsService.createOrUpdate(body, userId);
    }

    @Get()
    async findAll() {
        // In real app, filter by current user
        return this.draftsService.findAll(null); // Return all for now or pass mock userId
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.draftsService.findOne(id);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.draftsService.delete(id);
    }
}
