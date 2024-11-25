import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity({
    name: 'product_images',
})
export class ProductImage {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    @ManyToOne(
        //primer callback, con que entidad se relacionar
        () => Product,
        //segundo callback, con que campo de la entidad se relaciona
        (product) => product.images,
        //en las opciones de la relacion elegimos onDelete y CASCADE para que se eliminen los registros cuando se elimine un producto
        {onDelete: 'CASCADE'}
    )
    //nombre de la columna y con que entidad se relaciona
    product: Product;
    
}