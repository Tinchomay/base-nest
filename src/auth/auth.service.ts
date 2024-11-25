import { BadRequestException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    //inyectamos el servicio de los tokens, este viene previsto de nest, que a su vez es previsto por el JWTModule que creamos en el module auth
    private readonly jwtService: JwtService
  ){}

  private readonly logger = new Logger('Auth Service');

  private handleError(error : any): never{
    if(error.code === '23505'){
      throw new BadRequestException(error.detail)
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error, validate console');
  }
  
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      //esto elimina la propiedad
      delete user.password;
      return {
        ...user,
        token: this.getJWTToken({id: user.id})
      }
    } catch (error) {
      this.handleError(error)
    }
  }

  async login(loginUserDto: LoginUserDto){
    const { email, password } = loginUserDto;
    const emailLower = email.toLowerCase() 
    const user = await this.userRepository.findOne({
      //where para buscar
      where: {email: emailLower},
      //Con el select seleccionamos que columnas queremos traer
      select: {email: true, password: true, id:true},
    });

    if(!user) throw new UnauthorizedException('Invalid credentials')
    
    //comparamos la contraseña
    if(!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Invalid credentials')
    const token = this.getJWTToken( {id: user.id})
    // delete user.id
    // delete user.password
    return {
      ...user,
      token 
    };
  }

  async checkAuthStatus( user: User){
    const newToken = this.getJWTToken({id : user.id})
    delete user.isActive
    delete user.roles
    return {
      user,
      token: newToken
    }
  }

  //exportamos la interfaz de como sera el payload
  private getJWTToken( payload : JwtPayload) : string{
    //este metodo del servicio crea los tokens y vive segun nuestras configuraciones
    const token = this.jwtService.sign(payload);
    return token;
  }

}
