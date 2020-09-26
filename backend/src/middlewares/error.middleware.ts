import { ErrorRequestHandler } from 'express';
import { ValidationError as PayloadValidationError } from 'express-validation';
import { ValidationError as ConstraintsValidationError } from 'sequelize';
import { HttpException, HttpExceptionType } from '../exceptions';

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof PayloadValidationError) {
    return response.status(422).json({ type: HttpExceptionType.ValidationIssue, message: error.message });
  }

  if (error instanceof ConstraintsValidationError) {
    return response.status(422).json({ type: HttpExceptionType.ValidationIssue, message: error.message });
  }

  if (error instanceof HttpException) {
    return response.status(error.status).json({ type: error.type, message: error.message });
  }

  return response.status(500).json({ type: HttpExceptionType.InternalError, message: error.message });
};
