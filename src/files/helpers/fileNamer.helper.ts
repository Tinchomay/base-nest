import { Request } from "express";
import { v4 as uuid } from 'uuid';

export const fileNamer = (req: Request, file: Express.Multer.File, callback: Function) => {
    //en este punto ya debemos de tener un archivo pero no esta de mas validar
    if(!file) return callback( null, false);

    const fileExtesion = file.mimetype.split('/')[1];

    const fileName = `${uuid()}.${fileExtesion}`

    //Aqui si todo sale bien el segundo parametro del callback tiene que ser el nuevo nombre
    callback(null, fileName)
}