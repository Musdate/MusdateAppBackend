import { Bank } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {

    @IsString()
    name: string;

    @IsOptional()
    banks?: Bank[];

}