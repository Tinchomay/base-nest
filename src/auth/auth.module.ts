import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.srategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    TypeOrmModule.forFeature([User]),
    //utilizamos el passport module con defaultStrategy y jwt para configurar la autenticacion por medio de tokens
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (
        configService: ConfigService
      ) => {
        //Si no existe lanzamos un error, esto lo podriamos hacer en el configService
        if(!configService.get('JWT_SECRET')) throw new Error('JWT_SECRET missed')
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { 
            expiresIn: '2h' 
          }
        }
      }
    }),
    ConfigModule
],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule, AuthService]
})
export class AuthModule {}
