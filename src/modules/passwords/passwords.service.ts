
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { encryptValue, decryptValue } from '../../common/utils/crypto.util';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class PasswordsService {
    constructor(private prisma: PrismaService) { }

    async create(createPasswordDto: CreatePasswordDto, creatorId: string) {
        const encryptedUsername = encryptValue(createPasswordDto.username);
        const encryptedPassword = encryptValue(createPasswordDto.password);

        return this.prisma.passwordEntry.create({
            data: {
                ...createPasswordDto,
                username: encryptedUsername,
                password: encryptedPassword,
                createdBy: creatorId,
            }
        });
    }

    async findAll(userId: string, role: string) {
        // Return full list but filter access status client-side or mark access?
        // Requirement: "appear in the page as a card design and only show password title"
        // But "only assigned admins and moderators can see the password & email"
        // We can list all titles so everyone knows they exist? Or only list what they have access to?
        // "only slected admin or moderator can access the email/username and password" - implies title might be visible?
        // Let's allow listing all titles, but protect details. 
        // Or if strictly "without them anyone can't access it", maybe even title?
        // "appear in the page ... when user click on it he can see ... only slected ... can access"
        // This suggests title is public (to admins/mods/authorized users of the page), content is restricted.

        const entries = await this.prisma.passwordEntry.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return entries.map(entry => {
            const hasAccess = entry.accessIds.includes(userId) || entry.createdBy === userId;
            return {
                id: entry.id,
                title: entry.title,
                note: entry.note, // Note is visible? User said "additional note will also be shown in the singel page"
                createdAt: entry.createdAt,
                hasAccess,
                // Don't send encrypted stuff
            };
        });
    }

    async findOne(id: string, userId: string, role: string) {
        const entry = await this.prisma.passwordEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            throw new NotFoundException('Password entry not found');
        }

        // Strict Access Control
        const hasAccess = entry.accessIds.includes(userId) || entry.createdBy === userId;

        if (!hasAccess) {
            throw new ForbiddenException('You do not have access to this password');
        }

        return {
            ...entry,
            username: decryptValue(entry.username),
            password: decryptValue(entry.password),
        };
    }

    async update(id: string, updatePasswordDto: UpdatePasswordDto, userId: string, role: string) {
        const entry = await this.prisma.passwordEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            throw new NotFoundException('Password entry not found');
        }

        // Strict Access Control for Edit
        const hasAccess = entry.accessIds.includes(userId) || entry.createdBy === userId;
        if (!hasAccess) {
            throw new ForbiddenException('You do not have permission to edit this password');
        }

        const data: any = { ...updatePasswordDto };

        if (updatePasswordDto.username) {
            data.username = encryptValue(updatePasswordDto.username);
        }
        if (updatePasswordDto.password) {
            data.password = encryptValue(updatePasswordDto.password);
        }

        return this.prisma.passwordEntry.update({
            where: { id },
            data,
        });
    }

    async remove(id: string, userId: string, role: string) {
        const entry = await this.prisma.passwordEntry.findUnique({
            where: { id },
        });

        if (!entry) {
            throw new NotFoundException('Password entry not found');
        }

        // Strict Access Control for Delete
        const canDelete = entry.accessIds.includes(userId) || entry.createdBy === userId;
        if (!canDelete) {
            throw new ForbiddenException('You do not have permission to delete this entry');
        }

        return this.prisma.passwordEntry.delete({
            where: { id },
        });
    }
}
