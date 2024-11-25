import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

//Para crear un decorador de parametros utilizamos la funcion createParamDecorator
//la data es el primer parametro que le mandamos el decorador
//el ctx es el contexto donde se esta ejecutando el decorador
export const GetUser = createParamDecorator( (data, ctx: ExecutionContext) => {
    
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if(!user) throw new InternalServerErrorException('User not found (request)')

    return (!data) ? user : user[data]
})