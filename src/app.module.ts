import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { WalksModule } from './walks/walks.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGO_URI,
      { dbName: process.env.MONGO_DB_NAME }
    ),
    AuthModule,
    WalksModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
