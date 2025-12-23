import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAmenityDto } from './dto/create-amenity.dto';

@Injectable()
export class AmenitiesService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.amenity.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async create(createAmenityDto: CreateAmenityDto) {
        try {
            return await this.prisma.amenity.create({
                data: {
                    name: createAmenityDto.name,
                    icon: createAmenityDto.icon,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('Amenity with this name already exists');
            }
            throw error;
        }
    }

    async delete(id: string) {
        return this.prisma.amenity.update({
            where: { id },
            data: { isActive: false },
        });
    }
}
