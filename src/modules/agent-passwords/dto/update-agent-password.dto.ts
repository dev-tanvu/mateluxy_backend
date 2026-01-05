
import { PartialType } from '@nestjs/mapped-types';
import { CreateAgentPasswordDto } from './create-agent-password.dto';

export class UpdateAgentPasswordDto extends PartialType(CreateAgentPasswordDto) { }
