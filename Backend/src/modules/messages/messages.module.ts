import { Module, forwardRef } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { Message, MessageSchema } from './schema/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ConversationModule } from '../conversation/conversation.module';
import { Conversations, ConversationSchema } from '../conversation/schema/conversation.schema';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Message.name, schema: MessageSchema },
    { name: Conversations.name, schema: ConversationSchema }
  ]),
    forwardRef(() => ConversationModule),
    GatewayModule
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService]
})
export class MessagesModule {}
