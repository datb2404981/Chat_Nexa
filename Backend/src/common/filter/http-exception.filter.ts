import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  // Logger giúp em ghi lại lỗi vào console để debug (Best Practice)
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // 1. Lấy Status Code (400, 401, 500...)
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Lấy nội dung lỗi gốc từ NestJS (Cái nguyên liệu)
    const exceptionResponse = exception.getResponse();

    // 3. Xử lý message (Vì message có thể là string hoặc object/array)
    let errorMessage: string | string[];
    
    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      // Trường hợp này thường do class-validator trả về (lỗi mảng)
      errorMessage = (exceptionResponse as any).message || (exceptionResponse as any).error;
    } else {
      errorMessage = 'Internal Server Error';
    }

    // 4. Ghi log lỗi ra server (Để Developer xem)
    this.logger.error(
      `Method: ${request.method} | Path: ${request.url} | Error: ${JSON.stringify(errorMessage)}`
    );

    // 5. Trả về cho Client (Format chuẩn chỉnh)
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(), // Quan trọng để truy vết thời gian
      path: request.url,                   // Quan trọng để biết API nào lỗi
      method: request.method,              // GET/POST/PUT...
      message: errorMessage,               // Nội dung lỗi người dùng đọc được
    });
  }
}