import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

/**
 * JWT guard that does NOT reject unauthenticated requests.
 * If a valid token is present, req.user is populated; otherwise req.user remains undefined.
 * Used for endpoints that benefit from knowing who the user is when logged in.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context) as boolean;
    }

    handleReques(err: any, user: any) {
        // Don't throw on missing/invalid token - just return undefined
        if (err || !user) {
            return null;
        }
        return user;
    }
}