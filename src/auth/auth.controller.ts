import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  CreateUserDto,
  RegisterUserDto,
  LoginDto,
  UpdateUserDto
} from './dto';

import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor( private readonly authService: AuthService ) {}

  @Post()
  create( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create( createUserDto );
  }

  @Post('/register')
  register( @Body() registerUserDto: RegisterUserDto ) {
    return this.authService.register( registerUserDto );
  }

  @Post('/login')
  login( @Body() loginDto: LoginDto ) {
    return this.authService.login( loginDto );
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @UseGuards( AuthGuard )
  @Get('check-token')
  checkToken( @Request() req: Request ): LoginResponse {

    const user = req['user'] as User;

    return {
      user: user,
      token: this.authService.getJwt({ id: user._id })
    }

  }

  @UseGuards( AuthGuard )
  @Get(':id')
  findOne( @Param('id') id: string ) {
    return this.authService.findUserById( id );
  }

  @Patch('updateUser/:userId')
  updateUser( @Param('userId') userId: string, @Body() updateUserDto: UpdateUserDto ) {
    return this.authService.updateUser( userId, updateUserDto );
  }

  @UseGuards( AuthGuard )
  @Delete('/delete/:id')
  remove( @Param('id') id: string ) {
    return this.authService.remove( id );
  }
}
