export enum HttpExceptionType {
  NotFound = 'NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
  UnprocessableEntity = 'UNPROCESSABLE_ENTITY',
  ValidationIssue = 'VALIDATION_ISSUE',
  Unauthorized = 'UNAUTHORIZED',
  InternalError = 'INTERNAL_ERROR',
}

export class HttpException extends Error {
  public readonly status: number;
  public readonly type: HttpExceptionType;
  public readonly message: string;

  constructor(status: number, type: HttpExceptionType, message: string) {
    super(message);

    this.status = status;
    this.type = type;
    this.message = message;
  }
}
