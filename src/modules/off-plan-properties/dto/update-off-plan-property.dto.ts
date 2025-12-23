import { PartialType } from '@nestjs/mapped-types';
import { CreateOffPlanPropertyDto } from './create-off-plan-property.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOffPlanPropertyDto extends PartialType(CreateOffPlanPropertyDto) {
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
