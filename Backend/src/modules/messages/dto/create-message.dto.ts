import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMessageDto {
  @IsNotEmpty({ message: "Conversation Id không được để trống!" })
  @IsMongoId({ message: "Conversation Id không hợp lệ!" })
  conversationId: string

  @IsNotEmpty({ message: "Nội dung không được để trống!" })
  content: string

  @IsOptional()
  @IsEnum(['TEXT', 'IMAGE', 'FILE'], { message: 'Loại tin nhắn không hợp lệ (TEXT, IMAGE, FILE)' })
  type?: string

  @IsOptional()
  @IsString()
  imgUrl?: string
}
