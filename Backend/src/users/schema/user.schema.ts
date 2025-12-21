import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type UserDocument = Users & Document;

// 1️⃣ Đánh dấu đây là một schema
@Schema({ timestamps: true }) // timestamps = tự tạo createdAt, updatedAt
export class Users extends Document {

  // 2️⃣ Các thuộc tính (field)
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  refreshToken: string;

  @Prop()
  bio: string;

  @Prop()
  avatar: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  deletedAt: Date;

  @Prop()
  updatedAt: Date;
}

// 3️⃣ Tạo schema thật cho Mongoose
export const UserSchema = SchemaFactory.createForClass(Users);
