
import { Module } from '@nestjs/common';
import { AgentPasswordsService } from './agent-passwords.service';
import { AgentPasswordsController } from './agent-passwords.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AgentPasswordsController],
    providers: [AgentPasswordsService],
})
export class AgentPasswordsModule { }
