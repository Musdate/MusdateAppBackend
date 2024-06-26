import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import {
  CreateUserDto,
  UpdateUserDto,
  RegisterUserDto,
  LoginDto
 } from './dto';

@Injectable()
export class AuthService {

  constructor(

    @InjectModel( User.name )
    private userModel: Model<User>,
    private jwtService: JwtService

  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {

      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save();
      const { password:_, ...user } = newUser.toJSON();

      return user;

    } catch (error) {

      if ( error.code === 11000 ) {
        throw new BadRequestException(`[${ createUserDto.email }] ya existe.`);
      }

      throw new InternalServerErrorException('Un error inesperado ha ocurido');

    }

  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create( registerUserDto );

    return {
      user: user,
      token: this.getJwt({ id: user._id })
    }

  }

  async login ( loginDto: LoginDto ): Promise<LoginResponse> {

    const { email, password  } = loginDto;
    const user = await this.userModel.findOne({ email });

    if ( !user ) {
      throw new UnauthorizedException('Credenciales no válidas.')
    }
    
    if ( !bcryptjs.compareSync( password, user.password ) ) {
      throw new UnauthorizedException('Credenciales no válidas.')
    }

    const { password:_, ...userData } = user.toJSON();

    return {
      user: userData,
      token: this.getJwt({ id: user._id })
    }

  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id );
    const { password, ...userData } = user.toJSON();
  
    return userData;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwt( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }
}
