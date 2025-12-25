import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class SignInDto {
  @IsNotEmpty({ message: "Email không được để trống" })
  @IsEmail({}, { message: "Email không hợp lệ" })
  email: string;

  @IsNotEmpty({ message: "Password không được để trống" })
  password: string;
};

export class RegisterDto {
  @IsNotEmpty({ message: 'Tên không được để trống' })
  username: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
};
