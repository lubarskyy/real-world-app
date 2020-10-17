import { HttpException, HttpExceptionType } from './http.exception';

export class UnprocessableEntityException extends HttpException {
  constructor(message: string) {
    super(422, HttpExceptionType.UnprocessableEntity, message);
  }
}
