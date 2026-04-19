import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Aquí podemos añadir lógica adicional personalizada en el futuro,
    // como logging, o inyectar servicios. De momento usa la nativa.
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    // Lanzar error si la autenticación falla
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido o no proporcionado.');
    }
    return user;
  }
}
