
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PasswordsService } from './passwords.service';
import { CreatePasswordDto } from './dto/create-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';

@Controller('passwords')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('Password Manager')
export class PasswordsController {
    constructor(private readonly passwordsService: PasswordsService) { }

    @Post()
    create(@Body() createPasswordDto: CreatePasswordDto, @GetUser() user: any) {
        return this.passwordsService.create(createPasswordDto, user.id);
    }

    @Get()
    findAll(@GetUser() user: any) {
        return this.passwordsService.findAll(user.id, user.role);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @GetUser() user: any) {
        return this.passwordsService.findOne(id, user.id, user.role);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePasswordDto: UpdatePasswordDto, @GetUser() user: any) {
        return this.passwordsService.update(id, updatePasswordDto, user.id, user.role);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @GetUser() user: any) {
        return this.passwordsService.remove(id, user.id, user.role);
    }
}
