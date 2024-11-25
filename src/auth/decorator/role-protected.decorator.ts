import { SetMetadata } from '@nestjs/common';
import { ValidRoles } from '../interfaces/valid-roles';

//Asignamos el nombre del metadado ya en un solo lugar
export const ROLES = 'roles';

//Aqui recibe argumentos que le pasamos a el decorador
export const RoleProtected = (...args: ValidRoles[]) => {
    
    //retornamos la creacion de metadatos
    return SetMetadata(ROLES, args)
}
