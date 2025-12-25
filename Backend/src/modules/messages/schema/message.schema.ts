import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types,Document } from "mongoose";
import { Conversations } from "../../conversation/schema/conversation.schema";
import { Users } from "../../users/schema/user.schema";

export type MessageDocument = Message & Document;

@Schema({ timestamps: true }) 
export class Message {
  @Prop({ type: Types.ObjectId, ref: Conversations.name,required: true })
  conversationId: string;

  @Prop({ type: Types.ObjectId, ref: Users.name,required: true })
  senderID: string;

  @Prop({ required: true })
  content: string;

  @Prop({ enum: ['TEXT', 'IMAGE', 'FILE'], default: 'TEXT' })
  type: string;

  @Prop()
  fileUrl: string; // Dùng chung cho image/file (ERD dùng imgUrl)
  
  @Prop({
    type: {
      _id: { type: Types.ObjectId, ref: Users.name },
    }
  })
  updatedBy: { _id: Types.ObjectId};
  
  
  @Prop()
  deletedAt: Date;
  @Prop({
    type: {
      _id: { type: Types.ObjectId, ref: Users.name },
    }
  })
  deletedBy: { _id: Types.ObjectId};

  createdAt: Date;
  updatedAt: Date;
}


export const MessageSchema = SchemaFactory.createForClass(Message);
//giúp tìm tin nhắn của 1 cuộc hội thoại Và sắp xếp theo thời gian cực nhanh
MessageSchema.index({conversationId: 1,createdAt: -1})