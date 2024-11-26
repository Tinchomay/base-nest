import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image-entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: 'products'
})
export class Product {
    //decorador para generar id primary, puede recibir como parametro que tipo de id queremos, por defecto es el autoincrementado
    @ApiProperty({
        //agrega un valor de ejemplo
        example: 'b4610780-23f3-4898-a2e7-6f2621dce5a8',
        //Agrega descripcion
        description: 'Product ID',
        //indica que son valores unicos
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //decorador para definir la columna, primero va el tipo que vamos a definir, en el segundo es un objeto para definir propiedades de la columna
    @ApiProperty({
        example: 'T-Shirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;
    
    //el tipo de dato float para que se guarde como numero
    @ApiProperty({
        example: 0,
        description: 'Product price',
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({
        example: 'Lorem Ipsum',
        description: 'Product decription',
        default: null
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: 'tshirt-teslo',
        description: 'Product slug for SEO',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 5,
        description: 'Product stock',
        default: 0
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ['M', 'XL'],
        description: 'Product sizes'
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'women',
        description: 'Product gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ManyToOne(
        () => User,
        (user) => user.product,
        {onDelete: 'CASCADE'}
    )
    user: User;

    //la relacion una a muchos, necesita dos callbacks y unas opciones
    @ApiProperty()
    @OneToMany(
        //el primer parametro es con que entidad se va a relacionar
        () => ProductImage,
        //el segundo parametro define que columna va a relacionarse con la entidad principal, en ese campo ira el id de nuestro producto. En el callback se toma en minusculas la entidad que se va a relacionar y declaramos la columna.
        (productImage) => productImage.product,
        //opciones para la relacion, cascade true para eliminar todos las imagenes en dado caso de que se elimine el producto. El eager muestra las relaciones en los fins
        {cascade: true, eager: true}
    )
    //nombre de la columna y estas seran de tipo de la entidad con la que se relacionaran como un array
    images?: ProductImage[];

    //utilizamos este decorador
    @BeforeInsert()
    //Aqui definimos un metodo y lo llamamos como queramos
    checkSlugInsert(){
        //hacemos referencia al elemento que se esta insertando con this
        //si no existe creamos el slug
        if(!this.slug) {
            this.slug = this.title
        }
        //nos aseguramos de que sea de la manera que queremos
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate(){
        this.slug = this.title
            .toLowerCase()
            .replaceAll(' ','_')
            .replaceAll("'",'')
    }
}
