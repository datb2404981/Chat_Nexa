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

  @Prop({default:'./Frontend/public/default.jpg'})
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

// Tạo unique index nhưng chỉ áp dụng với các bản ghi chưa bị xóa (deleted: false hoặc không tồn tại)
UserSchema.index({ username: 1 }, { unique: true, partialFilterExpression: { deleted: { $eq: false } } });
UserSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deleted: { $eq: false } } });
