import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types,Document } from "mongoose";


export type ConversationDocument = Conversations & Document;

@Schema({ timestamps: true }) 
export class Conversations {
  @Prop({ default: false })
  isGroup: boolean;

  @Prop()
  name: string; // Tên nhóm (nếu là group)


  @Prop({ type: [{ type: Types.ObjectId, ref: 'Users' }] })
  members: Types.ObjectId[]; // Danh sách thành viên

  @Prop({ type: Object }) 
  lastMessage: {
    content: string;
    senderId: Types.ObjectId;
    createdAt: Date;
  };

  @Prop({ 
    type: [{ 
      userId: { type: Types.ObjectId, ref: 'Users' }, 
      lastSeenAt: Date 
    }], 
    default: [] 
  })
  readBy: { userId: Types.ObjectId, lastSeenAt: Date }[]; 

  @Prop({default:'./Frontend/public/default-group-avatar.svg'})
  avator: string;

    @Prop({
      type: {
        _id: { type: Types.ObjectId, ref: 'Users' },
      }
    })
    createBy: { _id: Types.ObjectId };
  
    @Prop({
      type: {
        _id: { type: Types.ObjectId, ref: 'Users' },
      }
    })
    updatedBy: { _id: Types.ObjectId };
  
  
    @Prop()
    deletedAt: Date;
    @Prop({
      type: {
        _id: { type: Types.ObjectId, ref: 'Users' },
      }
    })
    deletedBy: { _id: Types.ObjectId };
}

export const ConversationSchema = SchemaFactory.createForClass(Conversations);