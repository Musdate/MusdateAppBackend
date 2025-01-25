import { Prop } from "@nestjs/mongoose";

export class Walk {

    @Prop({ required: true })
    date: string;

    @Prop({ required: true })
    isNewWeek: boolean;

}