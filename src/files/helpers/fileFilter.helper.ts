import { Request } from "express";

//lo que hace este filter es dejar pasar el archivo o no
//requiere tres parametros, la request de express, el file de tipo Express.Multer.File para obtener el archivo y un callback que es lo que resolvera donde el primer parametro sera un error y el segundo si pasa el archivo o no
export const fileFilter = (req: Request, file: Express.Multer.File, callback: Function) => {

    if(!file) return callback( null, false);

    //Aqui obtenemos la extension que seria la primer posicion para obtener el jpg de image/jpg
    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    
    if(validExtensions.includes(fileExtension)){
        return callback( null, true)
    }

    callback(null, false)
}