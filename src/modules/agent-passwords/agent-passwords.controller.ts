
import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AgentPasswordsService } from './agent-passwords.service';
import { CreateAgentPasswordDto } from './dto/create-agent-password.dto';
import { UpdateAgentPasswordDto } from './dto/update-agent-password.dto';

@Controller('agent-passwords')
export class AgentPasswordsController {
    constructor(private readonly agentPasswordsService: AgentPasswordsService) { }

    @Post()
    create(@Body() createDto: CreateAgentPasswordDto) {
        return this.agentPasswordsService.create(createDto);
    }

    @Get()
    findAll() {
        return this.agentPasswordsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.agentPasswordsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateAgentPasswordDto) {
        return this.agentPasswordsService.update(id, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.agentPasswordsService.remove(id);
    }
}
