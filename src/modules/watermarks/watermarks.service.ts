import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { CreateWatermarkDto, UpdateWatermarkDto } from './dto/watermark.dto';

@Injectable()
export class WatermarksService {
    private readonly logger = new Logger(WatermarksService.name);

    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService,
    ) { }

    async findAll() {
        return this.prisma.watermark.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async getActive() {
        return this.prisma.watermark.findFirst({
            where: { isActive: true },
        });
    }

    // Create image watermark (with file upload)
    async create(dto: CreateWatermarkDto, file: Express.Multer.File) {
        // Upload the watermark image to S3
        const imageUrl = await this.uploadService.uploadFile(file);

        if (!imageUrl) {
            throw new Error('Failed to upload watermark image');
        }

        return this.prisma.watermark.create({
            data: {
                name: dto.name,
                type: 'image',
                imageUrl,
                position: dto.position || 'bottom-right',
                opacity: dto.opacity || 0.8,
                scale: dto.scale || 0.15,
                rotation: dto.rotation || 0,
                blendMode: dto.blendMode || 'Normal',
            },
        });
    }

    // Create text watermark (no file upload needed)
    async createTextWatermark(dto: CreateWatermarkDto) {
        if (!dto.text) {
            throw new Error('Text is required for text watermarks');
        }

        return this.prisma.watermark.create({
            data: {
                name: dto.name,
                type: 'text',
                text: dto.text,
                textColor: dto.textColor || '#FFFFFF',
                position: dto.position || 'bottom-right',
                opacity: dto.opacity || 0.8,
                scale: dto.scale || 0.15,
                rotation: dto.rotation || 0,
                blendMode: dto.blendMode || 'Normal',
            },
        });
    }

    async update(id: string, dto: UpdateWatermarkDto) {
        return this.prisma.watermark.update({
            where: { id },
            data: dto,
        });
    }

    async activate(id: string) {
        // First deactivate all watermarks
        await this.prisma.watermark.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });

        // Then activate the selected one
        return this.prisma.watermark.update({
            where: { id },
            data: { isActive: true },
        });
    }

    async deactivateAll() {
        // Set all watermarks to inactive (no watermark selected)
        await this.prisma.watermark.updateMany({
            where: { isActive: true },
            data: { isActive: false },
        });
        return { message: 'All watermarks deactivated' };
    }

    async delete(id: string) {
        const watermark = await this.prisma.watermark.findUnique({
            where: { id },
        });

        // Only delete file if it's an image watermark
        if (watermark?.type === 'image' && watermark?.imageUrl) {
            await this.uploadService.deleteFile(watermark.imageUrl);
        }

        return this.prisma.watermark.delete({
            where: { id },
        });
    }
}
