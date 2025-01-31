import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail()
    email: string;

    @IsString()
    name: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    banks?: Bank[];

}

export class Bank {

    @IsString()
    name: string;

    @IsString()
    number: string;

}