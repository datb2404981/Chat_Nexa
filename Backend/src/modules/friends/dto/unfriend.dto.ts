import { IsNotEmpty, IsMongoId } from 'class-validator';

export class UnfriendDto {
  @IsNotEmpty()
  @IsMongoId()
  friendId: string; // Đặt tên là friendId cho rõ nghĩa hơn receiverId
}