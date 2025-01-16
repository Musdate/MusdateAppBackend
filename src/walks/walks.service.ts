import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

  async create( createPetDto: CreatePetDto ): Promise<Pet> {
    
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

  async update( id: string , updatePetDto: UpdatePetDto ): Promise<Pet>  {

    const updatedPet = await this.petModel.findByIdAndUpdate( id, updatePetDto, {
      new: true,
      runValidators: true
    });

    if ( !updatedPet ) {
      throw new NotFoundException(`Mascota con ID "${ id }" no encontrada.`);
    }

    return updatedPet;
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

  async remove( id: string ): Promise<Pet> {
    return await this.petModel.findByIdAndDelete( id );
  }
}
