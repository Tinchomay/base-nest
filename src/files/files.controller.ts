import { Controller, Post, UploadedFile, UseInterceptors, BadRequestException, Get, Param, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';
import { fileNamer } from './helpers/fileNamer.helper';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}
  @Post('product')
  //Esto solo funciona con express
  //el interceptor se encarga de manejar la carga de archivos, como primer parametro tiene que ir el nombre del archivo que nos van a mandar
  @UseInterceptors(FileInterceptor('file', {
    //el fileFilter dice si pasa el archivo o no
    fileFilter: fileFilter,
    //establecer el limite de tamaño en bytes
    limits: {fileSize: 100000},
    storage: diskStorage({
      //Aqui es ./ hace referencia a la raiz del proyecto
      destination: './static/products',
      //aqui los parametros se pasan en automatico, generamos nombres unicos
      filename: fileNamer
    })
  }))
  uploadProductImage(
    //con este decorador obtenemos el archivo con el middleware Express.Multer.File de nest
    @UploadedFile() file: Express.Multer.File
  ){
    //en este punto el filter ya se aplico y estara el file si paso los filtros
    if(!file) throw new BadRequestException('Falta el archivo o la extension del archivo no es valida, solo se aceptan las siguientes: jpg, jpeg, png, gif');

    const secureUrl = `${this.configService.get('HOST_API')}/api/files/product/${file.filename}`;

    return {
      url: secureUrl
    };
  }

  @Get('product/:imageName')
  findProductImage(
    //este decorador rompe la respuesta automatica de nest, tenemos que especificar que vamos a responder y como
    @Res() res: Response,
    @Param('imageName') imageName : string
  ){
    const path = this.filesService.getStaticProductImage(imageName);

    //Aqui respondemos con el file
    res.sendFile(path);
  }
}
