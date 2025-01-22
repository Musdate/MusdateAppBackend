import { Module } from '@nestjs/common';
import { WalksService } from './walks.service';
import { WalksController } from './walks.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Pet, PetSchema } from './entities/pet.entity';
import { WalksPrice, WalksPriceSchema } from './entities/walks-price.entity';
import { User, UserSchema } from 'src/auth/entities/user.entity';

@Module({
  controllers: [ WalksController ],
  providers: [ WalksService ],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      { name: Pet.name, schema: PetSchema },
      { name: WalksPrice.name, schema: WalksPriceSchema },
      { name: User.name, schema: UserSchema }
    ])
  ]
})
export class WalksModule {}