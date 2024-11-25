import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image-entity";
import { User } from "src/auth/entities/user.entity";

@Entity({
    name: 'products'
})
export class Product {
    //decorador para generar id primary, puede recibir como parametro que tipo de id queremos, por defecto es el autoincrementado
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //decorador para definir la columna, primero va el tipo que vamos a definir, en el segundo es un objeto para definir propiedades de la columna
    @Column('text', {
        unique: true
    })
    title: string;
    
    //el tipo de dato float para que se guarde como numero
    @Column('float', {
        default: 0
    })
    price: number;

    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text', {
        array: true
    })
    sizes: string[];

    @Column('text')
    gender: string;

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
