import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Đặt tiền tố cho API: localhost:3000/api/v1/...
  app.setGlobalPrefix('api/v1');

  // 2. Cho phép Frontend gọi API (CORS)
  app.enableCors({
    origin: '*', // Tạm thời mở hết, sau này deploy sẽ chặn lại sau
    credentials: true,
  });

  // 3. Tự động validate dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động bỏ đi các field thừa
    forbidNonWhitelisted: true, // Báo lỗi nếu gửi field linh tinh lên
  }));

  const port = process.env.PORT || 8080;
  await app.listen(port);
  console.log(`🚀 Nexa Server is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
