import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Friends, FriendSchema } from './schema/friend.schema';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Friends.name, schema: FriendSchema }]),
    UsersModule
  ],
  controllers: [FriendsController],
  providers: [FriendsService],
  exports: [FriendsService]
})
export class FriendsModule {}
