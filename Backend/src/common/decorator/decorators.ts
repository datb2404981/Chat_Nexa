import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Nếu gọi @User('email') thì chỉ trả về email
    // Nếu gọi @User() thì trả về full object user
    return data ? user?.[data] : user;
  },
);

export const RESPONSE_MESSAGE = 'response_message';
export const ResponseMessage = (message: string) =>
  SetMetadata(RESPONSE_MESSAGE, message);

export const IS_PUBLIC_KEY = 'isPublic';
export const SkipPermission = () => SetMetadata(IS_PUBLIC_KEY, true);