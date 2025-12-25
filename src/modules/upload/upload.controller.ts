import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Delete, Body, Get, Query, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import type { Response } from 'express';

@Controller('upload')
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const url = await this.uploadService.uploadFile(file);
        if (!url) {
            throw new BadRequestException('File upload failed');
        }

        return { url };
    }

    @Delete('delete')
    async deleteFile(@Body('url') url: string) {
        if (!url) {
            throw new BadRequestException('URL is required');
        }
        await this.uploadService.deleteFile(url);
        return { message: 'File deleted successfully' };
    }

    @Get('optimize')
    async getOptimizedImage(
        @Query('url') url: string,
        @Query('w') width: string,
        @Query('q') quality: string,
        @Res() res: Response
    ) {
        if (!url) {
            throw new BadRequestException('URL is required');
        }

        const w = width ? parseInt(width) : 300;
        const q = quality ? parseInt(quality) : 20;

        try {
            const buffer = await this.uploadService.getOptimizedImage(url, w, q);

            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            });

            res.send(buffer);
        } catch (error) {
            // Fallback: Redirect to original image if optimization fails
            res.redirect(url);
        }
    }
}
