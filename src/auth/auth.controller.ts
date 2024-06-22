import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

import { 
  CreateUserDto,
  UpdateUserDto,
  RegisterUserDto,
  LoginDto
} from './dto';

import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  @Post()
  create( @Body() createUserDto: CreateUserDto ) {
    return this.authService.create(createUserDto);
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

  // @Get(':id')
  // findOne( @Param('id') id: string ) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update( @Param('id') id: string, @Body() updateUserDto: UpdateUserDto ) {
  //   return this.authService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove( @Param('id') id: string ) {
  //   return this.authService.remove(+id);
  // }
}
