import { IsNumber, IsOptional } from "class-validator";

export class CreateWalksPriceDto {

    @IsOptional()
    @IsNumber()
    oneDay : number;

    @IsOptional()
    @IsNumber()
    threeDays : number;

    @IsOptional()
    @IsNumber()
    fourDays : number;

    @IsOptional()
    @IsNumber()
    fiveDays : number;

}