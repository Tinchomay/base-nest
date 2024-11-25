import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/paginatio.dto';
import {validate as isUUID} from 'uuid';
import { ProductImage } from './entities/product-image-entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

  //para utilizar el logger de nest, utilizaremos Logger de @nestjs/common, como primer parametro ponemos el nombre de la clase donde vamos a utilizar el logger, esto servira para muchas cosas luego
  private readonly logger = new Logger('ProductService')

  //para inyectar un repositorio lo hacemos en el contructor
  constructor(
    //usamos este decorador y la entidad que vamos a inyectar
    @InjectRepository(Product)
    //creamos la propiedad de la entidadRepository y va a ser de tipo Repository(este viene de typeorm) y tiene que llevar la entidad entre <>
    private readonly productsRepository: Repository<Product>,

    //Insertamos el repositorio de las imagenes
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource : DataSource,
  ){}

  //hacemos asincrono el metodo porque los procesos con la bd son async
  async create(createProductDto: CreateProductDto, user:User) {
    try {
      //destructuramos las imagenes, si no viene designamos como un array vacio, y utilizamos el spread operator para asignar el resto de propiedades en una constante llamada productDetails
      const {images = [], ...productDetails} = createProductDto;

      //para crear elementos utilizamos el repository con el metodo create
      //ahora para crear el producto utilizamos lo que exparsimos del dto y el campo images que contendra un array de entidades de ProductImage
      const product = this.productsRepository.create({
        ...productDetails,
        user,
        //Aqui crearemos un array de products images con el repositorio
        images: images.map(image => this.productImageRepository.create({
          //solo le pasamos con dato la url de la image, porque el campo productId se llena en automatico por la creacion simultanea que estamos realizando
          url: image
        }))
      });
      await this.productsRepository.save(product)
      return {
        //exparsimos
        ...product,
        //reescribimos y regresamos el array de imagenes como lo mandamos
        // images
      };
    } catch (error) {
      this.handleExepctions(error);
    }
  }

  async findAll(paginationDto:PaginationDto) {
    const {limit = 10, offset = 0} = paginationDto;
    try {
      const products = await this.productsRepository.find({
        //take para establecer limite
        take: limit,
        //skip para saltar registros
        skip: offset,
        relations: {
          images: true
        }
      });
      return products.map(product => {
        return {
          ...product,
          images: product.images.map(image => image.url)
        }
      });
    } catch (error) {
      this.handleExepctions(error)
    }
  }

  async findOne(term: string) {
    let product : Product;
    if(isUUID(term)){
      product = await this.productsRepository.findOne({
        where: { id:term },
        relations: {
          images: true
        }
      })
    } else {
      //Aqui al builder le asignamos como primer elemento un alias que le daremos al nombre de la tabla del repository
      const queryBuilder = this.productsRepository.createQueryBuilder('prod');
      product = await queryBuilder
      //vamos a utilizar de una manera peculiar, se utiliza la columna que vamos a buscar y se pone =: para indicar que elemento buscara, y estos parametros se tienen que definir como segundo parametro
      //Aqui el metodo UPPER convierte todo el titulo a mayus y cuando estemos buscando el tittle tambien lo convertimos para que no importe el casesensitive
        .where(' UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        //en el leftJoinAndSelect, como primer parametro ira el alias que le dimos al builder, y con punto la relacion que queremos traer, el segundo parametro es un alias para un join despues pero es obligatorio
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne()
    }
    if (!product) throw new NotFoundException(`Product with term ${term} does not exist`); 

    return {
      ...product,
      images: product.images?.map(image => image.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user:User) {
    const {images, ...toUpdate} = updateProductDto
    //lo que hacemos aqui es buscar un producto por ese id, y le cargamos todas las propiedades que vienene en el dto
    const product = await this.productsRepository.preload({
      id,
      ...toUpdate
    });
    //aseguramos que no esta vacio
    if(product.slug === '') throw new BadRequestException(`Slug cannot be empty`)
    if(!product) throw new BadRequestException(`Product with ${id} no exists`)
    
    //Creamos el queryRunner con el datasource
    const queryRunner = this.dataSource.createQueryRunner();
    //conectamos a la BD
    await queryRunner.connect();
    //iniciamos el transaction
    await queryRunner.startTransaction();
    try {
      if(images) {
        //vamos a utilizar el queryRunner para eleiminar. utilizamos el manager, luego el delete y este lleva dos parametros, primero la entidad donde vamos a eliminar, luego el criterio con el que se va a eliminar, en este caso basados en la columna product los que coincidad con el id que viene desde el @Param de la peticion
        await queryRunner.manager.delete(ProductImage, {product: {id}});
        //asignamos las imagenes como nuevas instancias de la entidad
        product.images = images.map(image => this.productImageRepository.create({url: image}))
      }
      product.user = user; 
      //Aqui guardamos pero aun no se hace el commit
      await queryRunner.manager.save(product);
      //Aqui si todo salio bien hacemos el commit
      await queryRunner.commitTransaction();
      //cerramos la conexion
      await queryRunner.release();
      //retornamos el producto con una nueva consulta
      return this.findOne(id);
    } catch (error) {
      //si algo salio mal hacemos el rollback
      await queryRunner.rollbackTransaction();
      //cerramos la conexion
      await queryRunner.release();
      //Mostramos errores si hay
      this.handleExepctions(error)
    }
  }

  async remove(id: string) {
    const productDeleted = await this.findOne(id);
    try {
      await this.productsRepository.delete(id);
      return productDeleted;
    } catch (error) {
      this.handleExepctions(error)
    }
  }

  private handleExepctions(error: any){
    //el error 23505 es para cuando se duplican valores
    if(error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error)
    throw new InternalServerErrorException('Internal Server Error, check logs')
  }

  async deleteAllProducts() {
    const query = this.productsRepository.createQueryBuilder('product');
    try {
      return await query
        .delete()
        .where({})
        .execute();
    } catch (error) {
      this.handleExepctions(error);
    }
  }
}
