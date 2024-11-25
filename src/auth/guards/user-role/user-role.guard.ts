import { Reflector } from '@nestjs/core';
import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { User } from 'src/auth/entities/user.entity';
import { ROLES } from 'src/auth/decorator/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    //esta propiedad nos permite ver informacion de los decoradores y la metadata
    private readonly reflector : Reflector
  ){}
  //un guard necesita aplicar el metodo canActivate que resuelva un valor booleano
  //Si el guard llegase devolver un false va a arrojar un error 403 inmediatamente nest
  //tambien podemos lanzar excepciones si queremos
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    //utilizamos este metodo para obtener el metadato que queremos
    const validRoles : string[] = this.reflector.get(ROLES ,context.getHandler() );

    if(!validRoles) return true;
    if(validRoles.length === 0) return true;

    //utilizamos el context del canActivate para obtener el usuario
    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if(!user) throw new BadRequestException('User not found');

    //este array recorre cada uno de los roles de user y lo asigna a role
    for (const role of user.roles) {
      //Este if valida en ese momento el valor de role si esta incluido en el array de los validos
      if (validRoles.includes(role)) {
        return true
      }
    }
    throw new ForbiddenException(`User ${user.fullName} needs a valid role into ${validRoles}`);
  }
}
