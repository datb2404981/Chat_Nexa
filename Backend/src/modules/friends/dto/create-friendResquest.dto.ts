import { IsMongoId, IsNotEmpty, IsObject, IsOptional } from "class-validator";

export class createFriendRequestDto {
  @IsNotEmpty({ message: "Không được để trống ID người nhận kết bạn" })
  @IsMongoId({ message: "ID người nhận không hợp lệ" })
  receiverId: string;

  @IsOptional()
  message: string;
}
