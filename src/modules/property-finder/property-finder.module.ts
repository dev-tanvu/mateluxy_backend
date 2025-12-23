import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PropertyFinderService } from './property-finder.service';
import { PropertyFinderController } from './property-finder.controller';
import { PropertyFinderLeadsModule } from '../property-finder-leads/property-finder-leads.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
        PropertyFinderLeadsModule,
        IntegrationsModule
    ],
    controllers: [PropertyFinderController],
    providers: [PropertyFinderService],
    exports: [PropertyFinderService],
})
export class PropertyFinderModule { }
