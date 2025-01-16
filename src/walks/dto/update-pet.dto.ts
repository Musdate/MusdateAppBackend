import { PartialType } from '@nestjs/mapped-types';
import { CreatePetDto } from './create-pet.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdatePetDto extends PartialType(CreatePetDto) {

    @IsOptional()
    @IsString()
    comment : string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    walks : string[];

}