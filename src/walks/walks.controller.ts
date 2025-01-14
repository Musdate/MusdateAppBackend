import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WalksService } from './walks.service';
import { CreatePetDto } from './dto/create-pet.dto';
import { UpdatePetDto } from './dto/update-pet.dto';

@Controller('walks')
export class WalksController {

  constructor(private readonly walksService: WalksService) {}

  @Post()
  create( @Body() createPetDto: CreatePetDto ) {
    return this.walksService.create(createPetDto);
  }

  @Get()
  findAll() {
    return this.walksService.findAll();
  }s

  @Get(':id')
  findOne( @Param('id') id: string ) {
    return this.walksService.findOne(id);
  }

  @Patch(':id')
  update( @Param('id') id: string, @Body() updatePetDto: UpdatePetDto ) {
    return this.walksService.update( id, updatePetDto );
  }

  @Delete(':id')
  remove( @Param('id') id: string ) {
    return this.walksService.remove(id);
  }
}