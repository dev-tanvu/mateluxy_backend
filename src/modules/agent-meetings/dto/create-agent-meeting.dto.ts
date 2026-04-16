import { IsNotEmpty, IsOptional, IsString, IsArray, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAgentMeetingDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    subtitle?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsString()
    meetingLink: string;

    @IsNotEmpty()
    @IsDateString()
    meetingDate: string;

    @IsNotEmpty()
    @IsString()
    startTime: string;

    @IsOptional()
    @IsString()
    endTime?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    targetType?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map((id: string) => id.trim()).filter((id: string) => id);
            }
        }
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    targetAgentIds?: string[];
}
