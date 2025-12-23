import { Module } from '@nestjs/common';
import { OffPlanPropertiesController } from './off-plan-properties.controller';
import { OffPlanPropertiesService } from './off-plan-properties.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
    imports: [PrismaModule, ActivityModule],
    controllers: [OffPlanPropertiesController],
    providers: [OffPlanPropertiesService],
    exports: [OffPlanPropertiesService],
})
export class OffPlanPropertiesModule { }
