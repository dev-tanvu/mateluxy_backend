import { Module } from '@nestjs/common';
import { DevelopersService } from './developers.service';
import { DevelopersController } from './developers.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [PrismaModule, UploadModule, ActivityModule],
    controllers: [DevelopersController],
    providers: [DevelopersService],
    exports: [DevelopersService],
})
export class DevelopersModule { }
