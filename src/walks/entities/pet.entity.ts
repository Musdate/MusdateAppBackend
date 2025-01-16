import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema()
export class Pet {

    @Prop({ required: true })
    name : string;

    @Prop({ required: false })
    comment : string;

    @Prop({ required: false })
    walks : string[];

}

export const PetSchema = SchemaFactory.createForClass( Pet );