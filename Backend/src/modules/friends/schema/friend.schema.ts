import { IsEmail } from 'class-validator';
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types,Document } from "mongoose";

export type FriendDocument = Friends & Document;

@Schema({ timestamps: true }) 
export class Friends {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true })
  senderId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true })
  receiverId: mongoose.Schema.Types.ObjectId;

  @Prop({ enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' })
  status: string;

  @Prop()
  message: string;

  @Prop()
  createdAt: Date;
  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      email: String,
    }
  })
  createBy: { _id: Types.ObjectId, email: string };

  @Prop()
  updatedAt: Date;
  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      email: String,
    }
  })
  updatedBy: { _id: Types.ObjectId, email: string };


  @Prop()
  deletedAt: Date;
  @Prop({
    type: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
      email: String,
    }
  })
  deletedBy: { _id: Types.ObjectId, email: string };
}

export const FriendSchema = SchemaFactory.createForClass(Friends);
