import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, IsDateString, IsArray } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAgentDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    position: string;

    @IsNotEmpty()
    @IsString()
    department: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    phoneSecondary?: string;

    @IsOptional()
    @IsString()
    whatsapp?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    nationality?: string;

    @IsOptional()
    @IsString()
    linkedinAddress?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(lang => lang.trim()).filter(lang => lang);
        }
        return value;
    })
    @IsArray()
    languages?: string[];

    @IsOptional()
    @IsString()
    about?: string;

    @IsOptional()
    @IsDateString()
    birthdate?: string;

    @IsOptional()
    @IsDateString()
    joinedDate?: string;

    @IsOptional()
    experienceSince?: number;

    @IsOptional()
    @IsDateString()
    visaExpiryDate?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.split(',').map(area => area.trim()).filter(area => area);
        }
        return value;
    })
    @IsArray()
    areasExpertIn?: string[];
}
