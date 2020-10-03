import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { hash, compare } from 'bcrypt';
import { AuthenticationService } from '../services';
import { authMiddleware } from '../middlewares';
import { Controller } from '../interfaces';
import { NotFoundException } from '../exceptions';
import { User } from './user.model';
import { UserRegisterRequest, UserLoginRequest, UserResponse } from './user.types';
import { reqisterUserValidation, loginUserValidation } from './user.validation';

// PUT /api/user
// Example request body:
// {
//   "user":{
//     "email": "jake@jake.jake",
//     "bio": "I like to skateboard",
//     "image": "https://i.stack.imgur.com/xHWG8.jpg"
//   }
// }
// Authentication required, returns the User
// Accepted fields: email, username, password, image, bio

export class UsersController implements Controller {
  public path: Controller['path'] = '/users';
  public router: Controller['router'] = Router();
  private authService: typeof AuthenticationService;

  constructor(authService: typeof AuthenticationService) {
    this.authService = authService;
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, validate(reqisterUserValidation), this.registerUser);
    this.router.post(`${this.path}/login`, validate(loginUserValidation), this.loginUser);
    this.router.get(`${this.path}`, authMiddleware, this.getUser);
  }

  private registerUser: RequestHandler<never, UserResponse, UserRegisterRequest> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { email, username, password } = request.body.user;

    try {
      const hashedPassword = await hash(password, 10);
      const user = await User.create({ email, username, password: hashedPassword });
      const token = await this.authService.createJWTToken({ sub: user.id, username: user.username });

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

  private loginUser: RequestHandler<never, UserResponse, UserLoginRequest> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { email, password } = request.body.user;

    try {
      const user = await User.findOne({ where: { email } });
      const isPasswordValid = user ? await compare(password, user.password) : false;

      if (user && isPasswordValid) {
        const token = await this.authService.createJWTToken({ sub: user.id, username: user.username });

        response.send({
          user: {
            token,
            ...user.createUserPayload(),
          },
        });
      } else {
        next(new NotFoundException("User with provided credentials doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };

  private getUser: RequestHandler<never, UserResponse, never> = async (request, response, next): Promise<void> => {
    const { currentUser } = request;

    try {
      const user = await User.findOne({ where: { id: currentUser!.id } });

      if (user) {
        response.send({
          user: {
            token: currentUser!.token,
            ...user.createUserPayload(),
          },
        });
      } else {
        next(new NotFoundException("User doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };
}
