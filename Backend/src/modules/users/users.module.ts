import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Users, UserSchema } from './schema/user.schema';
import { ConversationModule } from '../conversation/conversation.module';
import { Conversations, ConversationSchema } from '../conversation/schema/conversation.schema';
import { FriendsModule } from '../friends/friends.module';
import { Friends, FriendSchema } from '../friends/schema/friend.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Users.name, schema: UserSchema },
      { name: Conversations.name, schema: ConversationSchema },
      { name: Friends.name, schema: FriendSchema }
    ]),
    forwardRef(() => ConversationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
