import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";
import { Bank } from "./create-user.dto";

export class RegisterUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    banks?: Bank[];

}