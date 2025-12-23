import { Controller, Get, Post, Body, Delete, Param } from '@nestjs/common';
import { AmenitiesService } from './amenities.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';

@Controller('amenities')
export class AmenitiesController {
    constructor(private readonly amenitiesService: AmenitiesService) { }

    @Get()
    findAll() {
        return this.amenitiesService.findAll();
    }

    @Post()
    create(@Body() createAmenityDto: CreateAmenityDto) {
        return this.amenitiesService.create(createAmenityDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.amenitiesService.delete(id);
    }
}
