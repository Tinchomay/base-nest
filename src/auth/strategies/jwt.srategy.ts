import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from '../entities/user.entity';
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

//lo que hace esta clase por si sola es validar si el token es valido pero como en nuestro caso necesitamos revisar si el usuario esta activo basados en la columna active vamos a implemetar codigo para validar eso
//en esta clase tenemos que extender PassportStrategy y pasarle Strategy
//hacemos injectable para que pueda ser inyectado
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        //inyectamos el repository porque vamos a acceder a la BD
        @InjectRepository(User)
        private readonly userRepository : Repository<User>,
        //inyectamos el servicio de configuracion para obtener la clave secreta
        configService : ConfigService
    ){
        //como extendemos una clase necesitamos llamar al constructor padre
        super({
            //pasamos la variable como primer argumento
            secretOrKey: configService.get('JWT_SECRET'),
            //Aqui vamos a poner en que parte de la peticion nos mandan el token
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }
    //Este codigo se ejecutara solo si ya se valido el token
    async validate(payload: JwtPayload) : Promise<User>{
        const { id } = payload;
        
        const user = await this.userRepository.findOne({where: {id}});
        if(!user) throw new UnauthorizedException("Token not valid");
        if(!user.isActive) throw new UnauthorizedException("User not active, please contact admin")
        
        //lo que retornemos aqui se va a añadir a la request, asi vamos a poder tener al user en todos los lugares que lo necesitemos
        return user;
    }
}