import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Walk } from "./walk.entity";

@Schema()
export class Pet {

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ required: true })
    name : string;

    @Prop({ required: false })
    comment : string;

    @Prop({ required: false })
    walks : Walk[];

    @Prop({ required: false })
    totalPrice: number;

}

export const PetSchema = SchemaFactory.createForClass( Pet );