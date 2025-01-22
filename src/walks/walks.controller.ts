import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalksService } from './walks.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';
import { CreateWalksPriceDto } from './dto/create-walks-price.dto';

@Controller('walks')
export class WalksController {

  constructor( private readonly walksService: WalksService ) {}

  @Post('/addPet')
  createPet( @Body() createPetDto: CreatePetDto ) {
    return this.walksService.createPet( createPetDto );
  }

  @Get('/getAllPets')
  findAllPets() {
    return this.walksService.findAllPets();
  }

  @Get('/getPet/:id')
  findOnePet( @Param('id') id: string ) {
    return this.walksService.findOnePet(id);
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
  addWalk( @Param('id') id: string, @Body('walk') walk: string ) {
    return this.walksService.addWalk( id, walk );
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