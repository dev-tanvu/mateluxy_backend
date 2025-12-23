import { Module } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { PropertiesController } from './properties.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { PropertyFinderModule } from '../property-finder/property-finder.module';
import { ActivityModule } from '../activity/activity.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
    imports: [PrismaModule, UploadModule, PropertyFinderModule, ActivityModule, IntegrationsModule],
    controllers: [PropertiesController],
    providers: [PropertiesService],
    exports: [PropertiesService],
})
export class PropertiesModule { }
