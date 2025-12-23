import { UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';

/**
 * Custom exception for invalid OTP
 */
export class InvalidOtpException extends UnauthorizedException {
    constructor(attemptsRemaining?: number) {
        const message = attemptsRemaining !== undefined
            ? `Invalid OTP. You have ${attemptsRemaining} attempt(s) remaining.`
            : 'Invalid OTP. Please try again.';

        super({
            statusCode: HttpStatus.UNAUTHORIZED,
            message,
            error: 'INVALID_OTP',
            attemptsRemaining,
        });
    }
}

/**
 * Custom exception for expired OTP
 */
export class ExpiredOtpException extends UnauthorizedException {
    constructor() {
        super({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'OTP has expired. Please request a new one.',
            error: 'OTP_EXPIRED',
        });
    }
}

/**
 * Custom exception for missing OTP
 */
export class MissingOtpException extends UnauthorizedException {
    constructor() {
        super({
            statusCode: HttpStatus.UNAUTHORIZED,
            message: 'No OTP found. Please request a new one.',
            error: 'OTP_NOT_FOUND',
        });
    }
}

/**
 * Custom exception for too many failed attempts
 */
export class TooManyOtpAttemptsException extends HttpException {
    constructor(lockoutDuration: number) {
        const minutes = Math.ceil(lockoutDuration / 60000);
        super(
            {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                message: `Too many failed attempts. Please try again in ${minutes} minute(s).`,
                error: 'TOO_MANY_ATTEMPTS',
                lockoutDuration: minutes,
            },
            HttpStatus.TOO_MANY_REQUESTS,
        );
    }
}

/**
 * Custom exception for invalid OTP format
 */
export class InvalidOtpFormatException extends UnauthorizedException {
    constructor() {
        super({
            statusCode: HttpStatus.BAD_REQUEST,
            message: 'OTP must be a 6-digit number.',
            error: 'INVALID_OTP_FORMAT',
        });
    }
}
