import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ResponseMessage, SkipPermission, User } from '../common/decorator/decorators';
import { RegisterDto, SignInDto } from './dto/AuthDto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { LocalAuthGuard } from './local-auth.guard';
import type { IUser } from '../users/users.interface';
import { GoogleAuthGuard } from './google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @SkipPermission() //dùng để không cần kiểm tra token
  @Post('login')
  @ResponseMessage("Login User")
  async login(
    @Body() loginInDto: SignInDto,
    @Res({ passthrough: true }) res: Response) {
    return await this.authService.login(loginInDto, res);
  }

  @SkipPermission() //dùng để không cần kiểm tra token
  @Post('register')
  @ResponseMessage("Register User")
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response) {
    return await this.authService.register(registerDto, res);
  }

  @SkipPermission() 
  @Post('refresh')
  @ResponseMessage("Refresh User")
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as any).cookies['refresh_token'];
    return await this.authService.processNewToken(refreshToken,res);
  }

  @Post('logout')
  @ResponseMessage("Logout User")
  async logout(
    @Res({ passthrough: true }) res: Response,
    @User()user :IUser) {
    return await this.authService.logout(user,res);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @SkipPermission()
  async googleLogin() {
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @SkipPermission()
  async googleLoginCallback(@Req() req, @Res({ passthrough: true }) res: Response) {
      return this.authService.loginGoogle(req.user, res);
  }
}
