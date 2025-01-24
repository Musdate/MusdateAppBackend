import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './entities/pet.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { WalksPrice } from './entities/walks-price.entity';
import { CreateWalksPriceDto } from './dto/create-walks-price.dto';
import { User } from 'src/auth/entities/user.entity';
import { isSameWeek, parse } from 'date-fns';

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

    const pet = await this.petModel.findById( id );

    if ( pet ) {

      let walksPrice = await this.walksPriceModel.findOne({ user: pet.user });

      if ( !walksPrice ) {
        walksPrice = new this.walksPriceModel();
      }

      pet.walks.push( walk );
      pet.totalPrice = this.calculateWalksPrice( pet, walksPrice );

      try {

        const updatedPet = await pet.save();
        return updatedPet;

      } catch {

        throw new InternalServerErrorException('Un error inesperado ha ocurido.');

      }

    } else {

      throw new NotFoundException(`Mascota con ID "${ id }" no encontrada.`);

    }
  }

  async createOrUpdateWalksPrice( userId: string, createWalksPrice: CreateWalksPriceDto ): Promise<WalksPrice> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const pets = await this.petModel.find({ user: user._id });

    if ( !pets ) {
      throw new NotFoundException('Mascotas no encontradas.');
    }

    try {

      const walksPrice = await this.walksPriceModel.findOneAndUpdate(
        { user: user._id },
        { ...createWalksPrice, user: user._id },
        { new: true, upsert: true }
      );

      for ( let pet of pets ) {

        pet.totalPrice = this.calculateWalksPrice( pet, walksPrice );

      }

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

  private calculateWalksPrice( pet: Pet, walksPrice: WalksPrice ): number {
    let numberOfDays = 0;
    let partialPrice = 0;
    let totalPrice = 0;
    let lastDate = new Date('1900-01-01');

    pet.walks.forEach(( walk, index) => {

      const currentDate = parse( walk, 'dd-MM-yyyy', new Date() );

      if ( index != 0 ) {
        lastDate = parse( pet.walks[ index - 1 ], 'dd-MM-yyyy', new Date() );
      }

      const isNewWeek = !isSameWeek( lastDate, currentDate, {weekStartsOn: 1} );

      if ( isNewWeek ) {
        totalPrice += partialPrice;
        partialPrice = 0;
        numberOfDays = 1;
      }

      switch ( numberOfDays ) {

        case 1:
        case 2:
          partialPrice = numberOfDays * walksPrice.oneDay;
          break;
        case 3:
          partialPrice = walksPrice.threeDays;
          break;
        case 4:
          partialPrice = walksPrice.fourDays;
          break;
        case 5:
          partialPrice = walksPrice.fiveDays;
          break;
        default:
          partialPrice = numberOfDays * walksPrice.oneDay;

      }

      if ( index === pet.walks.length - 1 ) {
        totalPrice += partialPrice;
      }

      numberOfDays ++;

    });

    return totalPrice;
  }
}