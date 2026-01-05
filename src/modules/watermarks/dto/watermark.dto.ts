import { IsString, IsOptional, IsNumber, Min, Max, IsIn } from 'class-validator';

export class CreateWatermarkDto {
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    @IsIn(['image', 'text'])
    type?: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    textColor?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    opacity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    scale?: number;

    @IsOptional()
    @IsNumber()
    rotation?: number;

    @IsOptional()
    @IsString()
    blendMode?: string;
}

export class UpdateWatermarkDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    textColor?: string;

    @IsOptional()
    @IsString()
    position?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    opacity?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(1)
    scale?: number;

    @IsOptional()
    @IsNumber()
    rotation?: number;

    @IsOptional()
    @IsString()
    blendMode?: string;
}
