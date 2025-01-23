import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './entities/pet.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WalksPrice } from './entities/walks-price.entity';
import { CreateWalksPriceDto } from './dto/create-walks-price.dto';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class WalksService {

  constructor(

    @InjectModel( Pet.name ) private readonly petModel: Model<Pet>,
    @InjectModel( WalksPrice.name ) private readonly walksPriceModel: Model<WalksPrice>,
    @InjectModel( User.name ) private readonly userModel: Model<User>

  ) {}

  async createPet( userId: string, createPetDto: CreatePetDto ): Promise<Pet> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    try {

      const newPet = new this.petModel({
        ...createPetDto,
        user: user._id
      });

      await newPet.save();

      return newPet;

    } catch (error) {

      throw new InternalServerErrorException('Un error inesperado ha ocurido.');

    }
  }

  async findAllPets( userId: string ): Promise<Pet[]> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.petModel.find({ user: user._id });
  }

  findOnePet( id: string ) {
    return this.petModel.findById( id );
  }

  async updatePet( id: string , updatePetDto: UpdatePetDto ): Promise<Pet>  {

    const updatedPet = await this.petModel.findByIdAndUpdate( id, updatePetDto, {
      new: true,
      runValidators: true
    });

    if ( !updatedPet ) {
      throw new NotFoundException(`Mascota con ID "${ id }" no encontrada.`);
    }

    return updatedPet;
  }

  async removePet( id: string ): Promise<Pet> {
    return await this.petModel.findByIdAndDelete( id );
  }

  async addWalk( id: string , walk: string ): Promise<Pet>  {

    const updatedPet = await this.petModel.findByIdAndUpdate( id,
      { $push: { walks: walk } },
      { new: true }
    );

    if ( !updatedPet ) {
      throw new NotFoundException(`Mascota con ID "${ id }" no encontrada.`);
    }

    return updatedPet;
  }

  async createOrUpdateWalksPrice( userId: string, createWalksPrice: CreateWalksPriceDto ): Promise<WalksPrice> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    try {

      const walksPrice = await this.walksPriceModel.findOneAndUpdate(
        { user: new Types.ObjectId( userId ) },
        { ...createWalksPrice, user: user._id },
        { new: true, upsert: true }
      );

      return walksPrice;

    } catch (error) {

      throw new InternalServerErrorException('Un error inesperado ha ocurido.');

    }
  }

  async findWalksPrice( userId: string ): Promise<WalksPrice> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const walksPrice = await this.walksPriceModel.findOne({ user: new Types.ObjectId( userId ) });

    if ( !walksPrice ) {
      return new this.walksPriceModel();
    }

    return walksPrice;
  }
}