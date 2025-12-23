import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter for standardized error responses
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const exceptionResponse = exception.getResponse();

        // Extract error details
        const errorResponse = typeof exceptionResponse === 'string'
            ? { message: exceptionResponse }
            : (exceptionResponse as any);

        // Build standardized error response
        const errorDetails = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message: errorResponse.message || exception.message,
            error: errorResponse.error || HttpStatus[status],
            ...(errorResponse.attemptsRemaining !== undefined && {
                attemptsRemaining: errorResponse.attemptsRemaining,
            }),
            ...(errorResponse.lockoutDuration !== undefined && {
                lockoutDuration: errorResponse.lockoutDuration,
            }),
        };

        // Log error for monitoring
        this.logger.error(
            `${request.method} ${request.url} - Status: ${status} - ${JSON.stringify(errorDetails.message)}`,
        );

        response.status(status).json(errorDetails);
    }
}
