import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";

@Schema()
export class WalksPrice {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: false, default: 0 })
    oneDay : number;

    @Prop({ required: false, default: 0 })
    threeDays : number;

    @Prop({ required: false, default: 0 })
    fourDays : number;

    @Prop({ required: false, default: 0 })
    fiveDays : number;

}

export const WalksPriceSchema = SchemaFactory.createForClass( WalksPrice );