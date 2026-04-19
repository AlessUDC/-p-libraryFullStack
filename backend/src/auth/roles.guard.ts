import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // Si la ruta no especifica roles, dejamos pasar (ya estará protegida por JWT si lo requiere)
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // Si no hay usuario por algún motivo, denegado.
    if (!user) {
      throw new ForbiddenException('No cuenta con credenciales del sistema.');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
       throw new ForbiddenException('No tienes permisos suficientes para realizar esta acción.');
    }
    
    return true;
  }
}
