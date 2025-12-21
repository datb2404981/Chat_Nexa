import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({message:"Username không được để trống"})
  username: string

  @IsNotEmpty({message:"Email không được để trống"})
  @IsEmail({},{message:"Email không đúng định dạng"})
  email: string

  @IsNotEmpty({message:"password không được để trống"})
  password: string

  @IsOptional()
  avatar?: string;
}
