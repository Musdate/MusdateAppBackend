import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePetDto, CreateWalkDto, CreateWalksPriceDto, UpdatePetDto } from './dto';
import { WalksService } from './walks.service';

@Controller('walks')
export class WalksController {

  constructor( private readonly walksService: WalksService ) {}

  @Post('/addPet/:userId')
  createPet( @Param('userId') userId: string, @Body() createPetDto: CreatePetDto ) {
    return this.walksService.createPet( userId, createPetDto );
  }

  @Get('/getAllPets/:userId')
  findAllPets( @Param('userId') userId: string ) {
    return this.walksService.findAllPets( userId );
  }

  @Get('/getPet/:petId')
  findOnePet( @Param('petId') petId: string ) {
    return this.walksService.findOnePet( petId );
  }

  @Patch('/updatePet/:id')
  updatePet( @Param('id') id: string, @Body() updatePetDto: UpdatePetDto ) {
    return this.walksService.updatePet( id, updatePetDto );
  }

  @Delete('/deletePet/:id')
  removePet( @Param('id') id: string ) {
    return this.walksService.removePet(id);
  }

  @Patch('/addWalk/:id')
  addWalk( @Param('id') id: string, @Body() createWalkDto: CreateWalkDto ) {
    return this.walksService.addWalk( id, createWalkDto );
  }

  @Post('/addWalksPrice/:userId')
  createOrUpdateWalksPrice( @Param('userId') userId: string, @Body() createWalksPrice: CreateWalksPriceDto ) {
    return this.walksService.createOrUpdateWalksPrice( userId, createWalksPrice );
  }

  @Get('/getWalksPrice/:userId')
  getWalksPrice( @Param('userId') userId: string ) {
    return this.walksService.findWalksPrice( userId );
  }
}