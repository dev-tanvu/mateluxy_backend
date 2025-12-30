
import { Module } from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { PasswordsController } from './passwords.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PasswordsController],
    providers: [PasswordsService],
    exports: [PasswordsService],
})
export class PasswordsModule { }
