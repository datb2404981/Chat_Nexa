import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt'; // Import để dùng JwtService
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
      // Config JWT giống hệt bên AuthModule để verify được token
      JwtModule.registerAsync({
        imports: [ConfigModule],
              global: true,
              useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_ACCESS_SECRET'),
                signOptions: {
                    expiresIn: configService.get<string>('JWT_ACCESS_EXPIRE') as any,
                },
              }),
              inject: [ConfigService],
      }),
  ],
  providers: [ChatGateway],
  exports: [ChatGateway] // Export để Service khác (như MessageService) có thể dùng
})
export class GatewayModule {}