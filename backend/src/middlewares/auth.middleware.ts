import { Request, RequestHandler } from 'express';
import { AuthenticationService } from '../services';
import { UnauthorizedException } from '../exceptions';

const createCurrentUserContext = async (token: string): Promise<Request['currentUser']> => {
  const tokenPayload = await AuthenticationService.decodeJWTToken(token);

  return tokenPayload
    ? {
        id: tokenPayload.sub,
        username: tokenPayload.username,
        token,
      }
    : undefined;
};

interface AuthMiddlewareOptions {
  optional?: boolean;
}

export const authMiddleware: (options?: AuthMiddlewareOptions) => RequestHandler = (options) => async (
  request,
  _,
  next,
) => {
  try {
    const authHeader = request.headers['authorization'];
    const [, token] = authHeader ? authHeader.split(' ') : [undefined];
    const unauthedException = new UnauthorizedException('The user is not authorized to make the request.');

    if (options?.optional && token) {
      request.currentUser = await createCurrentUserContext(token);
      return next();
    }

    if (!token) {
      return next(unauthedException);
    }

    const currentUserContext = await createCurrentUserContext(token);

    if (!currentUserContext) {
      return next(unauthedException);
    }

    request.currentUser = currentUserContext;
    next();
  } catch (error) {
    next(error);
  }
};
