import { Module } from '@nestjs/common';
import { PropertyFinderLeadsService } from './property-finder-leads.service';
import { PropertyFinderLeadsController } from './property-finder-leads.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PropertyFinderLeadsController],
    providers: [PropertyFinderLeadsService],
    exports: [PropertyFinderLeadsService],
})
export class PropertyFinderLeadsModule { }
