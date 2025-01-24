import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import * as bcryptjs from 'bcryptjs';
import { Connection, Model } from 'mongoose';
import { Pet } from 'src/walks/entities/pet.entity';
import { WalksPrice } from 'src/walks/entities/walks-price.entity';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';

import {
  CreateUserDto,
  LoginDto,
  RegisterUserDto
} from './dto';

@Injectable()
export class AuthService {

  constructor(

    @InjectConnection() private readonly connection: Connection,
    @InjectModel( Pet.name ) private readonly petModel: Model<Pet>,
    @InjectModel( WalksPrice.name ) private readonly walksPriceModel: Model<WalksPrice>,

    @InjectModel( User.name )
    private readonly userModel: Model<User>,
    private readonly jwtService: JwtService

  ) {}

  async create( createUserDto: CreateUserDto ): Promise<User> {

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

  async register( registerUserDto: RegisterUserDto ): Promise<LoginResponse> {

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

  async remove( id: string ) {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {

      const user = await this.userModel.findById( id ).session( session );

      if ( !user ) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      await this.petModel.deleteMany({ user: user._id }).session(session);
      await this.walksPriceModel.deleteMany({ user: user._id }).session(session);
      await this.userModel.findByIdAndDelete( id ).session(session);

      await session.commitTransaction();

    } catch (error) {

      await session.abortTransaction();
      throw new InternalServerErrorException('Un error inesperado ha ocurido.');

    } finally {
      session.endSession();
    }
  }

  getJwt( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }
}