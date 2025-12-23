import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, SignInDto } from './dto/AuthDto';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../users/users.interface';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(loginInDto: SignInDto, res: Response): Promise<any> {
    //tìm kiếm có tài khoản không
    const user = await this.usersService.findOne(loginInDto.email);
    if (!user) {
      throw new UnauthorizedException("Email hoặc password không đúng!");
    }

    //kiểm tra mật khẩu
    const isValid = await this.usersService.isValidPassword(loginInDto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("Email hoặc password không đúng!");
    }

    //trả token
    return await this.handleTokenAndCookie(user, res);
  }


  async register(registerDto: RegisterDto, res: Response): Promise<any> {
    //tạo tài khoản và check tài khoản đã có chưa
    const newUser = await this.usersService.create(registerDto); 

    //Trả token
    return await this.handleTokenAndCookie(newUser, res);
  }

  async processNewToken(refresh_token : string,res : Response) {
    try {
      //Verify token (kiểm tra token)
      const payload = await this.jwtService.verifyAsync(refresh_token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')
      });
      
      //kiểm tra user
      const user = await this.usersService.findOne(payload.email);
      if (!user) {
        throw new BadRequestException("Tài khoản không tồn tại");
      }else if (user.refreshToken !== refresh_token) {
        throw new UnauthorizedException("Token không hợp lệ. Vui lòng login lại!")
      } else {
        return this.handleTokenAndCookie(user, res);
      }

    } catch (error) {
      throw new UnauthorizedException("Token không hợp lệ. Vui lòng login lại!")
    }
  }

  async logout(user : IUser, res : Response ) {
    //xóa refresh token khỏi user
    const userUpdate = await this.usersService.update(user.email, { refreshToken: null });
    res.clearCookie('refresh_token');
    return true;
  }

  async loginGoogle(googleUser: any, res: Response) {
      let user: any = await this.usersService.findOne(googleUser.email);
      if (!user) {
        const password = Math.random().toString(36).slice(-8);
        const username = `${googleUser.firstName || ''} ${googleUser.lastName || ''}`.trim() || googleUser.email.split('@')[0];
        
        //tạo user
        user = await this.usersService.create({
            email: googleUser.email,
            username: username,
            password: password,
            avatar: googleUser.picture
        });
      }
    
    //trả token
      return await this.handleTokenAndCookie(user, res);
  }

  private async handleTokenAndCookie(user: any, response: Response) {
    const payload = {
      sub: user._id,
      email: user.email,
      username: user.username,
    };

    const access_token = await this.jwtService.signAsync(payload);
    const refresh_token = await this.createRefreshToken(payload);

    //lưu refresh_token vào database
    await this.usersService.update(user.email, { refreshToken: refresh_token });

    // Set Cookie một chỗ duy nhất -> Dễ quản lý
    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false, // Ensure secure is false for localhost debugging
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
      }
    }
  }

  private async createRefreshToken(payload: any) {
    return await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: (this.configService.get<string>('JWT_REFRESH_EXPIRE') || '1d') as any,
    });
  }

  async validateGoogleUser(googleUser: any) {
    // 1. Tìm xem user đã có trong DB chưa
    const user = await this.usersService.findOne(googleUser.email);

    if (user) {
        // Có rồi -> Đây là Login -> Trả về user luôn
        return user;
    }

    // 2. Chưa có -> Đây là Register -> Tạo mới
    const newUser = await this.usersService.create({
        email: googleUser.email,
        username: `${googleUser.lastName} ${googleUser.firstName}`,
        avatar: googleUser.picture,
        password: '', // Để trống hoặc random string
    });

    return newUser;
}
}
