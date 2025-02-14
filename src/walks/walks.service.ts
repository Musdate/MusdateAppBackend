import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { isSameWeek, parse } from 'date-fns';
import { Connection, Model, Types } from 'mongoose';
import { User } from 'src/auth/entities/user.entity';
import { CreatePetDto, CreateWalksPriceDto, UpdatePetDto } from './dto';
import { Pet, Walk } from './entities';
import { WalksPrice } from './entities/walks-price.entity';

@Injectable()
export class WalksService {

  constructor(

    @InjectConnection() private readonly connection: Connection,
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

      throw new InternalServerErrorException('Ocurrió un error inesperado al crear una mascota.');

    }
  }

  async findAllPets( userId: string ): Promise<Pet[]> {

    const user = await this.userModel.findById( userId );

    if ( !user ) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return this.petModel.find({ user: user._id });
  }

  async findOnePet( id: string ) {
    return await this.petModel.findById( id );
  }

  async updatePet( id: string , updatePetDto: UpdatePetDto ): Promise<Pet>  {

    const pet = await this.petModel.findById( id );

    if ( pet ) {

      let walksPrice = await this.walksPriceModel.findOne({ user: pet.user });

      if ( !walksPrice ) {
        walksPrice = new this.walksPriceModel();
      }

      const { totalPrice, pendingPrice } = this.calculateWalksPrice( updatePetDto.walks, walksPrice );

      updatePetDto.totalPrice = totalPrice;
      updatePetDto.pendingPrice = pendingPrice;

      const updatedPet = await this.petModel.findByIdAndUpdate( id, updatePetDto, {
        new: true,
        runValidators: true
      });

      if ( !updatedPet ) {
        throw new NotFoundException(`Mascota no encontrada.`);
      }

      return updatedPet;

    } else {

      throw new NotFoundException(`Mascota no encontrada.`);

    }
  }

  async removePet( id: string ): Promise<Pet> {

    try {

      return await this.petModel.findByIdAndDelete( id );

    } catch {

      throw new InternalServerErrorException('Ocurrió un error inesperado al eliminar mascota.');

    }
  }

  async addWalk( id: string , walk: Walk ): Promise<Pet>  {

    const pet = await this.petModel.findById( id );

    if ( pet ) {

      let walksPrice = await this.walksPriceModel.findOne({ user: pet.user });

      if ( !walksPrice ) {
        walksPrice = new this.walksPriceModel();
      }

      pet.walks.push( walk );

      const { totalPrice, pendingPrice } = this.calculateWalksPrice( pet.walks, walksPrice );

      pet.totalPrice = totalPrice;
      pet.pendingPrice = pendingPrice;

      try {

        const updatedPet = await pet.save();
        return updatedPet;

      } catch {

        throw new InternalServerErrorException('Ocurrió un error inesperado al crear un paseo.');

      }

    } else {

      throw new NotFoundException(`Mascota no encontrada.`);

    }
  }

  async createOrUpdateWalksPrice( userId: string, createWalksPrice: CreateWalksPriceDto ): Promise<WalksPrice> {

    const session = await this.connection.startSession();
    session.startTransaction();

    try {

      const user = await this.userModel.findById( userId ).session( session );

      if ( !user ) {
        throw new NotFoundException('Usuario no encontrado.');
      }

      const pets = await this.petModel.find({ user: user._id }).session( session );

      if ( !pets || pets.length === 0 ) {
        throw new NotFoundException('Mascotas no encontradas.');
      }

      const walksPrice = await this.walksPriceModel.findOneAndUpdate(
        { user: user._id },
        { ...createWalksPrice, user: user._id },
        { new: true, upsert: true }
      ).session( session );

      for ( const pet of pets ) {

        const { totalPrice, pendingPrice } = this.calculateWalksPrice( pet.walks, walksPrice );

        pet.totalPrice = totalPrice;
        pet.pendingPrice = pendingPrice;

        await pet.save({ session });

      }

      await session.commitTransaction();

      return walksPrice;

    } catch ( error ) {

      await session.abortTransaction();

      if ( error instanceof NotFoundException ) {
        throw error;
      }

      throw new InternalServerErrorException('Ocurrió un error inesperado al crear o actualizar el precio de paseos.');

    } finally {

      session.endSession();

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


  // FUNCTIONS

  private calculateWalksPrice( walks: Walk[], walksPrice: WalksPrice ): { totalPrice: number, pendingPrice: number } {
    let weekWalks = 0;
    let paidWalks = 0;
    let pendingPrice = 0;
    let totalPrice = 0;
    let lastDate = new Date('1900-01-01');

    const calculateWeeklyPrice = (): number => {
      switch ( weekWalks ) {
        case 1:
        case 2:
          return  weekWalks * walksPrice.oneDay;
        case 3:
          return  walksPrice.threeDays ||
                  weekWalks * walksPrice.oneDay;
        case 4:
          return  walksPrice.fourDays ||
                  weekWalks * ( walksPrice.threeDays / 3 ) ||
                  weekWalks * walksPrice.oneDay;
        case 5:
          return  walksPrice.fiveDays ||
                  weekWalks * ( walksPrice.fourDays / 4 ) ||
                  weekWalks * ( walksPrice.threeDays / 3 ) ||
                  weekWalks * walksPrice.oneDay;
        case 6:
        case 7:
          return  weekWalks * ( walksPrice.fiveDays / 5 ) ||
                  weekWalks * ( walksPrice.fourDays / 4 ) ||
                  weekWalks * ( walksPrice.threeDays / 3 ) ||
                  weekWalks * walksPrice.oneDay;
        default:
          return weekWalks * walksPrice.oneDay;
      }
    };

    const addWeeklyPrices = () => {
      if ( weekWalks > 0 ) {
        const partialPrice = calculateWeeklyPrice();
        totalPrice += partialPrice;
        pendingPrice += partialPrice * (( weekWalks - paidWalks ) / weekWalks );
      }
    };

    walks.forEach(( walk, index ) => {

      const currentDate = parse( walk.date, 'dd-MM-yyyy', new Date() );

      if ( index != 0 ) {
        lastDate = parse( walks[ index - 1 ].date, 'dd-MM-yyyy', new Date() );
      }

      const isNewWeek = !isSameWeek( lastDate, currentDate, {weekStartsOn: 1} );


      if ( isNewWeek ) {

        addWeeklyPrices();

        weekWalks = 1;
        paidWalks = walk.paid ? 1 : 0;
        walk.isNewWeek = true;

      } else {

        weekWalks++;

        if ( walk.paid ) {
          paidWalks++;
        }

      }

      if ( index === walks.length - 1 ) {

        addWeeklyPrices();

      }
    });

    return {
      totalPrice: totalPrice,
      pendingPrice: pendingPrice
    };
  }
}