import { Module } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { AgentsController } from './agents.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { PropertyFinderModule } from '../property-finder/property-finder.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [PrismaModule, UploadModule, PropertyFinderModule, ActivityModule],
    controllers: [AgentsController],
    providers: [AgentsService],
    exports: [AgentsService],
})
export class AgentsModule { }
