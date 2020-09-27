import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { hash, compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { Controller } from '../interfaces';
import { NotFoundException } from '../exceptions';
import { User } from './user.model';
import { UserRegisterRequest, UserLoginRequest, UserResponse } from './user.types';
import { reqisterUserValidation, loginUserValidation } from './user.validation';

export class UsersController implements Controller {
  public path: Controller['path'] = '/users';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, validate(reqisterUserValidation), this.registerUser);
    this.router.post(`${this.path}/login`, validate(loginUserValidation), this.loginUser);
  }

  private createJWTToken(user: User): string {
    return sign({ sub: user.id, name: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  }

  private registerUser: RequestHandler<{}, UserResponse, UserRegisterRequest> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { email, username, password } = request.body.user;

    try {
      const hashedPassword = await hash(password, 10);
      const user = await User.create({ email, username, password: hashedPassword });
      const token = this.createJWTToken(user);

      response.send({
        user: {
          token,
          ...user.createUserPayload(),
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private loginUser: RequestHandler<{}, UserResponse, UserLoginRequest> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { email, password } = request.body.user;

    try {
      const user = await User.findOne({ where: { email } });
      const isPasswordValid = user ? await compare(password, user.password) : false;

      if (user && isPasswordValid) {
        const token = this.createJWTToken(user);

        response.send({
          user: {
            token,
            ...user.createUserPayload(),
          },
        });
      } else {
        next(new NotFoundException("User with provided credentails doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };
}
