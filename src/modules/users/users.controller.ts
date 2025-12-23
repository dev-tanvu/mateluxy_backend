import { Body, Controller, Get, Post, UseGuards, UseInterceptors, UploadedFile, Query, Delete, Patch, Param, Ip } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { Role } from '@prisma/client';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UploadService } from '../upload/upload.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly uploadService: UploadService,
    ) { }

    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Permissions('Users')
    @Post('create')
    @UseInterceptors(FileInterceptor('avatar'))
    async create(
        @Body() createUserDto: CreateUserDto,
        @GetUser() user: any,
        @UploadedFile() file?: Express.Multer.File,
        @Ip() ip?: string,
    ) {
        try {
            console.log('File received:', file ? `Yes - ${file.originalname}` : 'No file');
            console.log('CreateUserDto:', createUserDto);

            let avatarUrl: string | undefined;
            if (file) {
                const uploadedUrl = await this.uploadService.uploadFile(file);
                console.log('Upload result:', uploadedUrl);
                avatarUrl = uploadedUrl || undefined;
            }

            // Ensure permissions is an array (handle multipart/form-data string)
            if (typeof createUserDto.permissions === 'string') {
                try {
                    createUserDto.permissions = JSON.parse(createUserDto.permissions);
                } catch (e) {
                    console.error('Failed to parse permissions:', e);
                    createUserDto.permissions = [];
                }
            }

            const result = await this.usersService.create(createUserDto, avatarUrl, user?.id, ip);
            console.log('User created with avatarUrl:', result.avatarUrl);
            console.log('User created with permissions:', result.permissions);
            return result;
        } catch (error) {
            console.error('Error creating user:', error);
            // Write error to file for debugging
            const fs = require('fs');
            fs.writeFileSync('backend_error.log', `Error: ${JSON.stringify(error, null, 2)}\nStack: ${error.stack}\n`);
            throw error;
        }
    }

    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN, Role.MODERATOR)
    @Permissions('Users')
    @Get()
    findAll(
        @Query('search') search?: string,
        @Query('role') role?: Role | 'All',
    ) {
        return this.usersService.findAll(search, role);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@GetUser() user: any) {
        return this.usersService.findById(user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN)
    @Permissions('Users')
    @Delete(':id')
    remove(@Param('id') id: string, @GetUser() user: any, @Ip() ip?: string) {
        return this.usersService.remove(id, user?.id, ip);
    }

    @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
    @Roles(Role.ADMIN)
    @Permissions('Users')
    @Patch(':id')
    @UseInterceptors(FileInterceptor('avatar'))
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
        @GetUser() user: any,
        @UploadedFile() file?: Express.Multer.File,
        @Ip() ip?: string,
    ) {
        let avatarUrl: string | undefined;
        if (file) {
            avatarUrl = await this.uploadService.uploadFile(file) || undefined;
        }

        // Ensure permissions is an array (handle multipart/form-data string)
        if (typeof updateUserDto.permissions === 'string') {
            try {
                updateUserDto.permissions = JSON.parse(updateUserDto.permissions);
            } catch (e) {
                console.error('Failed to parse permissions:', e);
                updateUserDto.permissions = [];
            }
        }

        // Handle isActive boolean conversion from string (multipart/form-data)
        if (updateUserDto.isActive !== undefined) {
            // @ts-ignore - handling potential string input from FormData
            if (String(updateUserDto.isActive) === 'true') {
                updateUserDto.isActive = true;
            } else if (String(updateUserDto.isActive) === 'false') {
                updateUserDto.isActive = false;
            }
        }

        return this.usersService.update(id, updateUserDto, avatarUrl, user?.id, ip);
    }
}
