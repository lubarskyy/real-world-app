export enum HttpExceptionType {
  NotFound = 'NOT_FOUND',
  BadRequest = 'BAD_REQUEST',
  ValidationIssue = 'VALIDATION_ISSUE',
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
