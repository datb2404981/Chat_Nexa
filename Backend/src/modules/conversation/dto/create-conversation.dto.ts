import { ArrayMinSize, IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateDirectConversationDto {
  @IsNotEmpty({ message: 'Receiver ID không được để trống' })
  @IsMongoId({ message: 'Receiver ID phải là MongoID hợp lệ' })
  receiverId: string;
}

export class CreateGroupConversationDto {
  @IsOptional()
  @IsString()
  name?: string; // Tên nhóm (Optional)

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(2, { message: 'Nhóm phải có tối thiểu 2 thành viên khác (ngoài bạn)' })
  @IsMongoId({ each: true, message: 'Danh sách thành viên chứa ID không hợp lệ' })
  memberIds: string[];
}
