import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateDeveloperDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    about?: string;

    @IsNotEmpty()
    @IsString()
    salesManagerName: string;

    @IsNotEmpty()
    @IsEmail()
    salesManagerEmail: string;

    @IsNotEmpty()
    @IsString()
    salesManagerPhone: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch {
                return value.split(',').map((lang: string) => lang.trim()).filter((lang: string) => lang);
            }
        }
        return value;
    })
    @IsArray()
    @IsString({ each: true })
    languages?: string[];
}
