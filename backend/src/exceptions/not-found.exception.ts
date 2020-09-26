import { HttpException, HttpExceptionType } from './http.exception';

export class NotFoundException extends HttpException {
  constructor(message: string) {
    super(404, HttpExceptionType.NotFound, message);
  }
}
