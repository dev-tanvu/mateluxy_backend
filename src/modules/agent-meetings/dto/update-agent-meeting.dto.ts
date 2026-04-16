import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString } from 'class-validator';
import { CreateAgentMeetingDto } from './create-agent-meeting.dto';

export class UpdateAgentMeetingDto extends PartialType(CreateAgentMeetingDto) {
    @IsOptional()
    @IsString()
    status?: string;
}
