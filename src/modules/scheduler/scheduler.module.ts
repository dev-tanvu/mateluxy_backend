import { Module } from '@nestjs/common';
import { SyncSchedulerService } from './sync-scheduler.service';
import { PropertiesModule } from '../properties/properties.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PropertiesModule, IntegrationsModule, PrismaModule],
    providers: [SyncSchedulerService],
    exports: [SyncSchedulerService],
})
export class SchedulerModule { }
