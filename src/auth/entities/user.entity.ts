import { Product } from "src/products/entities/product.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true
    })
    email: string;

    @Column('text', {
        //el select el false para que en cualquier consulta nunca regresa la contraseña
        select: false
    })
    password: string;

    @Column('text')
    fullName: string;
    
    @Column('bool', {
        default: true
    })
    isActive: string;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @OneToMany( 
        () => Product,
        (product) => product.user,
        {cascade: true}
        // {cascade: true, eager: true}
    )
    product : Product[];

    @BeforeInsert()
    emailToLowerBeforeInsert(){
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    emailToLowerBeforeUpdate(){
        this.email = this.email.toLowerCase().trim();
    }
}
