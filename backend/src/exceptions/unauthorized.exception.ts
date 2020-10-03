import { HttpException, HttpExceptionType } from './http.exception';

export class UnauthorizedException extends HttpException {
  constructor(message: string) {
    super(401, HttpExceptionType.Unauthorized, message);
  }
}
