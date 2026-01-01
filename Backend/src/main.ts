import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './modules/App/app.module';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Đặt tiền tố cho API: localhost:3000/api/v1/...
  app.setGlobalPrefix('api/v1');

  // 2. Cho phép Frontend gọi API (CORS)
  app.enableCors({
    origin: true, // Allow all origins temporarily to debug, or keep specific ['http://localhost:5173']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  });

  // 3. Tự động validate dữ liệu
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động bỏ đi các field thừa
    forbidNonWhitelisted: true, // Báo lỗi nếu gửi field linh tinh lên
  }));

  // 4. Kích hoạt Interceptor Global
  // Cần Reflector để đọc được cái decorator @ResponseMessage
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()));

  //5. config cookie
  app.use(cookieParser());

  const port = process.env.PORT || 8080;
  await app.listen('0.0.0.0');
  console.log(`🚀 Nexa Server is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
