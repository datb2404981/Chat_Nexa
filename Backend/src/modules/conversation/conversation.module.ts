import { Module, forwardRef } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Conversations, ConversationSchema } from './schema/conversation.schema';
import { FriendsModule } from '../friends/friends.module';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Conversations.name, schema: ConversationSchema }]),
  FriendsModule,forwardRef(() => MessagesModule)],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService]
})
export class ConversationModule {}
