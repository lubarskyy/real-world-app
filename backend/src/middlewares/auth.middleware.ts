import { RequestHandler } from 'express';
import { AuthenticationService } from '../services';
import { UnauthorizedException } from '../exceptions';

export const authMiddleware: RequestHandler = async (request, _, next) => {
  try {
    const authHeader = request.headers['authorization'];
    const [, token] = authHeader ? authHeader.split(' ') : [undefined];
    const unauthedException = new UnauthorizedException('The user is not authorized to make the request.');

    if (!token) {
      return next(unauthedException);
    }

    const tokenPayload = await AuthenticationService.decodeJWTToken(token);

    if (!tokenPayload) {
      return next(unauthedException);
    }

    request.currentUser = {
      id: tokenPayload.sub,
      username: tokenPayload.username,
      token,
    };

    next();
  } catch (error) {
    next(error);
  }
};
