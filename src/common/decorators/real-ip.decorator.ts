import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

/**
 * Custom decorator to extract the real client IP address.
 * Handles X-Forwarded-For header for applications behind a reverse proxy.
 */
export const RealIp = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const request = ctx.switchToHttp().getRequest<Request>();

        // Check X-Forwarded-For header (set by proxies/load balancers)
        const xForwardedFor = request.headers['x-forwarded-for'];
        if (xForwardedFor) {
            // X-Forwarded-For can be a comma-separated list; the first IP is the client
            const ips = typeof xForwardedFor === 'string'
                ? xForwardedFor.split(',')
                : xForwardedFor;
            const clientIp = ips[0].trim();
            if (clientIp) {
                return clientIp;
            }
        }

        // Check X-Real-IP header (common in Nginx configurations)
        const xRealIp = request.headers['x-real-ip'];
        if (xRealIp) {
            return typeof xRealIp === 'string' ? xRealIp : xRealIp[0];
        }

        // Fallback to socket address
        const socketAddress = request.socket?.remoteAddress;
        if (socketAddress) {
            // Handle IPv6-mapped IPv4 addresses (e.g., ::ffff:192.168.1.1)
            const ipv4Match = socketAddress.match(/::ffff:(.+)/);
            return ipv4Match ? ipv4Match[1] : socketAddress;
        }

        return 'unknown';
    },
);
