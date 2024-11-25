import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image-entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  //importamos con forFeature para decirle a typeORM que esta entidad estara disponible para este modulo
  imports: 
  [
    TypeOrmModule.forFeature([Product, ProductImage]), 
    AuthModule
  ],
  //exportamos el servicio y el modulo de typeORM para acceder a los repository
  exports: [ProductsService, TypeOrmModule]
})
export class ProductsModule {}
