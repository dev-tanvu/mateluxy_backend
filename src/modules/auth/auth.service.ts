import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user && (await bcrypt.compare(pass, user.password))) {
            // Check if account is active
            if (!user.isActive) {
                throw new UnauthorizedException('Your account has been deactivated. Please contact support.');
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const tokens = await this.getTokens(user.id, user.username, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async logout(userId: string) {
        return this.usersService.updateRefreshToken(userId, null);
    }

    async refreshTokens(userId: string, rt: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

        const rtMatches = await bcrypt.compare(rt, user.refreshToken);
        if (!rtMatches) throw new ForbiddenException('Access Denied');

        const tokens = await this.getTokens(user.id, user.username, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async updateRefreshToken(userId: string, rt: string) {
        await this.usersService.updateRefreshToken(userId, rt);
    }

    async getTokens(userId: string, username: string, role: string) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, username, role },
                { secret: process.env.JWT_SECRET, expiresIn: '15m' },
            ),
            this.jwtService.signAsync(
                { sub: userId, username, role },
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
            ),
        ]);

        return {
            accessToken: at,
            refreshToken: rt,
        };
    }

    async forgotPassword(usernameOrEmail: string, deviceId: string) {
        const user = await this.usersService.findOne(usernameOrEmail);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check device lock
        if (deviceId) {
            const deviceLock = await this.usersService.findDeviceLock(user.id, deviceId);
            if (deviceLock?.lockedUntil && new Date() < deviceLock.lockedUntil) {
                const lockoutDuration = deviceLock.lockedUntil.getTime() - Date.now();
                const minutes = Math.ceil(lockoutDuration / 60000);
                throw new UnauthorizedException({
                    message: `This device is temporarily locked due to too many failed OTP attempts. Please try again in ${minutes} minute(s).`,
                    error: 'ACCOUNT_LOCKED',
                    lockoutDuration: minutes,
                    lockedUntil: deviceLock.lockedUntil,
                });
            }
        }

        // In development, use static OTP '123456'
        const otp = process.env.NODE_ENV === 'production' ? this.generateOTP() : '123456';
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await this.usersService.updateOtp(user.id, otp, otpExpiresAt);

        // Reset attempts for this device if it exists
        if (deviceId) {
            await this.usersService.upsertDeviceLock(user.id, deviceId, 0, null);
        }

        // TODO: In production, send OTP via email
        return { message: 'OTP sent successfully' };
    }

    async resetPassword(usernameOrEmail: string, otp: string, newPassword: string, deviceId: string) {
        const user = await this.usersService.findOne(usernameOrEmail);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // Check device lock
        if (deviceId) {
            const deviceLock = await this.usersService.findDeviceLock(user.id, deviceId);
            if (deviceLock?.lockedUntil && new Date() < deviceLock.lockedUntil) {
                const lockoutDuration = deviceLock.lockedUntil.getTime() - Date.now();
                const minutes = Math.ceil(lockoutDuration / 60000);
                throw new UnauthorizedException({
                    message: `This device is temporarily locked due to too many failed OTP attempts. Please try again in ${minutes} minute(s).`,
                    error: 'TOO_MANY_ATTEMPTS',
                    lockoutDuration: minutes,
                });
            }
        }

        // Check if OTP exists
        if (!user.otp || !user.otpExpiresAt) {
            throw new UnauthorizedException({
                message: 'No OTP found. Please request a new one.',
                error: 'OTP_NOT_FOUND',
            });
        }

        // Check if OTP has expired
        if (new Date() > user.otpExpiresAt) {
            await this.usersService.updateOtp(user.id, null, null);
            throw new UnauthorizedException({
                message: 'OTP has expired. Please request a new one.',
                error: 'OTP_EXPIRED',
            });
        }

        // Validate OTP
        if (user.otp !== otp) {
            if (deviceId) {
                const deviceLock = await this.usersService.findDeviceLock(user.id, deviceId);
                const attemptCount = (deviceLock?.attempts || 0) + 1;
                const maxAttempts = 5;
                const attemptsRemaining = maxAttempts - attemptCount;

                if (attemptCount >= maxAttempts) {
                    const lockoutDuration = 15 * 60 * 1000; // 15 minutes
                    const lockedUntil = new Date(Date.now() + lockoutDuration);
                    await this.usersService.upsertDeviceLock(user.id, deviceId, attemptCount, lockedUntil);

                    throw new UnauthorizedException({
                        message: `Too many failed attempts. Device locked for 15 minutes.`,
                        error: 'TOO_MANY_ATTEMPTS',
                        lockoutDuration: 15,
                    });
                }

                await this.usersService.upsertDeviceLock(user.id, deviceId, attemptCount, null);

                throw new UnauthorizedException({
                    message: `Invalid OTP. You have ${attemptsRemaining} attempt(s) remaining.`,
                    error: 'INVALID_OTP',
                    attemptsRemaining,
                });
            } else {
                // Fallback if no device ID provided
                throw new UnauthorizedException('Invalid OTP');
            }
        }

        // OTP is valid - reset password and clear OTP data
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.usersService.updatePassword(user.id, hashedPassword);
        await this.usersService.updateOtp(user.id, null, null);

        if (deviceId) {
            await this.usersService.upsertDeviceLock(user.id, deviceId, 0, null);
        }

        return { message: 'Password reset successfully' };
    }

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}
