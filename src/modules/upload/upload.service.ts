import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import axios from 'axios';

@Injectable()
export class UploadService {
    private s3Client: S3Client | null = null;
    private bucketName: string;
    private region: string;
    private readonly logger = new Logger(UploadService.name);
    private isConfigured = false;

    constructor(private configService: ConfigService) {
        const region = this.configService.get<string>('AWS_REGION') || '';
        const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
        const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';
        const bucketName = this.configService.get<string>('AWS_BUCKET_NAME') || '';

        if (!region || !accessKeyId || !secretAccessKey || !bucketName) {
            this.logger.warn('AWS S3 credentials not configured. Avatar uploads will be skipped.');
            this.isConfigured = false;
            return;
        }

        try {
            this.s3Client = new S3Client({
                region,
                credentials: {
                    accessKeyId,
                    secretAccessKey,
                },
            });
            this.bucketName = bucketName;
            this.region = region;
            this.isConfigured = true;
            this.logger.log('AWS S3 client initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize S3 client:', error);
            this.isConfigured = false;
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string | null> {
        if (!this.isConfigured || !this.s3Client) {
            this.logger.warn('Skipping S3 upload - AWS not configured');
            return null;
        }

        try {
            const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
            let key = `${uuidv4()}.${fileExtension}`;
            let buffer = file.buffer;
            let contentType = file.mimetype;

            // Optimize image if it's an image type
            if (file.mimetype.startsWith('image/')) {
                try {
                    buffer = await this.optimizeImage(file.buffer);
                    // Force jpg/content-type if converted, but keeping original ext for now mainly unless we force conversion to webp/jpg
                    // strict resizing to 1920x1080 inside
                } catch (optError) {
                    this.logger.warn('Image optimization failed, uploading original:', optError);
                }
            }

            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                    ACL: 'public-read', // Make image publicly accessible for Property Finder
                }),
            );

            const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
            this.logger.log(`File uploaded successfully: ${url}`);
            return url;
        } catch (error) {
            this.logger.error('Failed to upload file to S3:', error);
            return null;
        }
    }

    private async optimizeImage(buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
            .resize(1920, 1080, {
                fit: 'inside',
                withoutEnlargement: true,
            })
            .jpeg({ quality: 80, mozjpeg: true }) // Compress efficiently
            .toBuffer();
    }

    // New method for on-the-fly optimization of external images
    async getOptimizedImage(imageUrl: string, width: number = 300, quality: number = 20): Promise<Buffer> {
        try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            return sharp(response.data)
                .resize(width, null, { // Maintain aspect ratio based on width
                    withoutEnlargement: true
                })
                .jpeg({ quality, mozjpeg: true }) // High compression for thumbnails
                .toBuffer();
        } catch (error) {
            this.logger.error(`Failed to optimize external image: ${imageUrl}`, error);
            throw new Error('Failed to fetch/optimize image');
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        if (!this.isConfigured || !this.s3Client) {
            return;
        }

        try {
            // Extract key from URL
            // URL format: https://bucket-name.s3.region.amazonaws.com/key
            const urlParts = fileUrl.split('/');
            const key = urlParts[urlParts.length - 1];

            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                }),
            );
            this.logger.log(`File deleted successfully: ${key}`);
        } catch (error) {
            this.logger.error('Failed to delete file from S3:', error);
        }
    }
}
