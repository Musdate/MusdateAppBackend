import { IsArray, IsString } from "class-validator";
import { Walk } from "../entities/walk.entity";

export class CreatePetDto {

    @IsString()
    name: string;

    @IsString()
    comment : string;

    @IsArray()
    @IsString({ each: true })
    walks : Walk[];

}