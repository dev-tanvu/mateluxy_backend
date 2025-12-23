import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAmenityDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
