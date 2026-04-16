import { Module } from '@nestjs/common';
import { AgentMeetingsService } from './agent-meetings.service';
import { AgentMeetingsController } from './agent-meetings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AgentMeetingsController],
    providers: [AgentMeetingsService],
    exports: [AgentMeetingsService],
})
export class AgentMeetingsModule {}
