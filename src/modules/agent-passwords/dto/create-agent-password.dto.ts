
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgentPasswordDto {
    @IsString()
    @IsNotEmpty()
    agentId: string;

    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
