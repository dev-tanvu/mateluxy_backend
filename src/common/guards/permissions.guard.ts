import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermissions) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        // Admins can access everything
        if (user.role === Role.ADMIN) {
            return true;
        }

        // Moderators need specific permissions
        if (user.role === Role.MODERATOR) {
            if (!user.permissions) {
                return false;
            }
            return requiredPermissions.some((permission) =>
                user.permissions.includes(permission)
            );
        }

        return false;
    }
}
