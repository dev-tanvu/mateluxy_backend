import { PartialType } from '@nestjs/mapped-types';
import { CreateDeveloperDto } from './create-developer.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateDeveloperDto extends PartialType(CreateDeveloperDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
