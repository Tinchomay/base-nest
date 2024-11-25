import { applyDecorators, UseGuards } from "@nestjs/common";
import { ValidRoles } from "../interfaces/valid-roles";
import { RoleProtected } from "./role-protected.decorator";
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";


export function Auth(...roles : ValidRoles[]){
    return applyDecorators(
        //Aqui los decoradores no necesitan el @

        //este decorador agrega los roles que son necesarios para acceder a esta ruta
        RoleProtected( ...roles ),
        //ete decorador utiliza primero el strategy para validar el usuario, el de UserRoleGuard extrae los roles definidos por RoleProtected ademas compara si el user que se cargo con el strategy del bearer token tiene el rol necesario
        UseGuards( AuthGuard(), UserRoleGuard)
    )
}