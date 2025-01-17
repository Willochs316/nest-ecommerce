import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { Role } from './role.enum';
import { ROLES_KEY } from './role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  // canActivate(
  //   context: ExecutionContext,
  // ): boolean | Promise<boolean> | Observable<boolean> {
  //   return true;
  // }

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    const user = context.switchToHttp().getRequest().user;

    if (!user || !user.role) {
      throw new UnauthorizedException('User not authenticated or role not found');
    }

    const hasRequiredRole = requiredRoles.some((role) => user.role === role)

    if (!hasRequiredRole) {
      throw new UnauthorizedException('User does not have required role');
    }

    return hasRequiredRole
  }
}