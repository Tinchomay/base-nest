import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class SeedService {
  
  constructor(
    private readonly productsService: ProductsService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ){}

  async runSeed(){
    await this.deleteTables();
    const adminUser = await this.insertUsers();
    await this.insertNewProducts(adminUser)
    return 'Seed executed'
  }

  private async insertNewProducts(user: User){
    //creamos una const donde guardamos todos los productos
    const products = initialData.products;

    //creamos un array que contendra promesas de insersion
    const insertPromises = [];

    //llenamos el array vacio con promesas de creaciones de productos
    products.forEach(product => {
     insertPromises.push(this.productsService.create(product, user))
    })

    //esperamos a que todas las promesas se cumplan, esto ejecuta todas las promesas al mismo tiempo
    await Promise.all(insertPromises);

    //retornamos true
    return true;
  }

  private async deleteTables(){
    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  private async insertUsers(){
    const seedUsers = initialData.users;

    const users : User[] = [];

    seedUsers.forEach( (user) => {
      users.push(this.userRepository.create({
        ...user,
        password: bcrypt.hashSync(user.password, 10),
      }))
    });
    
    const dbUsers = await this.userRepository.save(users);

    return dbUsers[0];
  }
}
