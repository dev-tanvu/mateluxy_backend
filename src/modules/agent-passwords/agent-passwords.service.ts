
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAgentPasswordDto } from './dto/create-agent-password.dto';
import { UpdateAgentPasswordDto } from './dto/update-agent-password.dto';
// Assuming crypto utils are available here
import { encryptValue, decryptValue } from '../../common/utils/crypto.util';

@Injectable()
export class AgentPasswordsService {
    constructor(private prisma: PrismaService) { }

    async create(createDto: CreateAgentPasswordDto) {
        // Find agent to ensure existence?? Prisma handles foreign key, but good to check or let prisma fail.
        // We'll trust prisma foreign key constraint.

        // Encrypt password (and email? User requirement didn't specify, but safer? 
        // Typically email is not encrypted to allow search/display, but password is essential).
        // Let's encrypt ONLY password as is standard, unless requested otherwise.

        return this.prisma.agentPassword.create({
            data: {
                ...createDto,
                // Encrypt password if encryptValue is available and intended
                // If it's reversible encryption, we use encryptValue. If hash, we use bcrypt.
                // Since this is a "Password Manager" feature, we need to show the password back, 
                // so we MUST use reversible encryption.
                password: encryptValue(createDto.password),
            },
            include: {
                agent: true
            }
        });
    }

    async findAll() {
        const passwords = await this.prisma.agentPassword.findMany({
            include: {
                agent: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Decrypt for display
        return passwords.map(p => ({
            ...p,
            password: decryptValue(p.password)
        }));
    }

    async findOne(id: string) {
        const entry = await this.prisma.agentPassword.findUnique({
            where: { id },
            include: { agent: true }
        });

        if (!entry) throw new NotFoundException('Agent password entry not found');

        return {
            ...entry,
            password: decryptValue(entry.password)
        };
    }

    async update(id: string, updateDto: UpdateAgentPasswordDto) {
        const data: any = { ...updateDto };

        if (updateDto.password) {
            data.password = encryptValue(updateDto.password);
        }

        return this.prisma.agentPassword.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        return this.prisma.agentPassword.delete({
            where: { id }
        });
    }
}
