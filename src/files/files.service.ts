import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';


@Injectable()
export class FilesService {
  getStaticProductImage( imageName : string){
    //Con esto creamos el path de la ruta de la imagen, el primer parametro da la direccion completa del archivo donde estamos, luego nos vamos hasta la carpeta products para poner el nombre de la imagen
    const path = join(__dirname, '../../static/products/', imageName);

    //Con esto comprobamos si existe la imagen en la ruta que creamos
    if(!existsSync(path)){
        throw new BadRequestException(`File ${imageName} not exists`)
    } 
    
    return path;
  }
}
