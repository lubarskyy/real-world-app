import { ErrorRequestHandler } from 'express';
import { ValidationError as PayloadValidationError } from 'express-validation';
import { ValidationError as ConstraintsValidationError } from 'sequelize';

// TODO: create HttpException
// status code
// message - enum?

export const errorMiddleware: ErrorRequestHandler = (error, request, response, next) => {
  if (error instanceof PayloadValidationError) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof ConstraintsValidationError) {
    return response.status(422).json(error);
  }

  return response.status(500).json(error);
};
