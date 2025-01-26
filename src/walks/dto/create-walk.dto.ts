import { IsBoolean, IsString } from "class-validator";

export class CreateWalkDto {

    @IsString()
    date: string;

    @IsBoolean()
    isNewWeek : boolean;

    @IsBoolean()
    paid : boolean;

}