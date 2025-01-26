import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Walk } from '../entities';

export class UpdatePetDto extends PartialType(CreatePetDto) {

    @IsOptional()
    @IsString()
    comment : string;

    @IsOptional()
    @IsArray()
    walks : Walk[];

    @IsOptional()
    @IsNumber()
    totalPrice: number;

    @IsOptional()
    @IsNumber()
    pendingPrice: number;

}