import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { Pet } from './entities/pet.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class WalksService {

  constructor(
  
    @InjectModel( Pet.name )
    private readonly petModel: Model<Pet>

  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    
    try {
    
      const newPet = new this.petModel( createPetDto );
      return newPet.save();
    
    } catch (error) {

      throw new InternalServerErrorException('Un error inesperado ha ocurido');

    }
  }

  findAll(): Promise<Pet[]> {
    return this.petModel.find();
  }

  findOne( id: string ) {
    return `This action returns a #${id} walk`;
  }

  update( id: string , updatePetDto: UpdatePetDto ) {
    return `This action updates a #${id} walk`;
  }

  async remove( id: string ): Promise<Pet> {
    console.log('eliminado el id:', id);
    return await this.petModel.findByIdAndDelete( id );
  }
}
