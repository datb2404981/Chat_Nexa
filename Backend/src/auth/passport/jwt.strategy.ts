import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Lấy token từ header Authorization: Bearer ...
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Token hết hạn là chặn luôn
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') as string, // Lấy secret từ .env
    });
  }

  // Khi Token hợp lệ, hàm này chạy và trả về thông tin user
  async validate(payload: any) {
    return { 
      _id: payload.sub, 
      email: payload.email,
      username: payload.username 
    };
  }
}