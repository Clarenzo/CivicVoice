import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { ROLES_KEY } from "../roles.decorator";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true; // No roles required - JWTDuard already handled auth
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new ForbiddenException("Authentication required");
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException("You do not have permission to perform this action!");
        }

        return true;
    } 
}