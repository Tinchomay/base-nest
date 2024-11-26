import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorator/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorator/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorator/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles';
import { Auth } from './decorator/auth.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticacíon')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }
  
  @Get('check-status')
  @Auth() 
  checkAuthStatus(
    @GetUser() user: User
  ){
    return this.authService.checkAuthStatus(user)
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user:User,
    @GetUser('email') userEmail:User,
    @RawHeaders() rawHeaders : string[]
  ){
    return {
      user,
      userEmail,
      rawHeaders
    };
  }

  @Get('private2')
  @RoleProtected( ValidRoles.admin, ValidRoles.superUser )
  @UseGuards( AuthGuard(), UserRoleGuard )
  private2(
    @GetUser() user:User,
  ){
    return {
      user
    }
  }
  
  @Get('private3')
  @Auth()
  private3(
    @GetUser() user:User,
  ){
    return {
      user
    }
  }

}
