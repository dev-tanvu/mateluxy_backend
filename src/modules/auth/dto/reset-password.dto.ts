import { IsString, IsNotEmpty, MinLength, Matches, Length } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Username or email is required' })
    usernameOrEmail: string;

    @IsString()
    @IsNotEmpty({ message: 'OTP is required' })
    @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
    @Matches(/^[0-9]{6}$/, { message: 'OTP must be a 6-digit number' })
    otp: string;

    @IsString()
    @IsNotEmpty({ message: 'New password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    newPassword: string;
}
