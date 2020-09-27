import { Joi } from 'express-validation';
import { UserRegisterRequest, UserLoginRequest } from './user.types';

export const reqisterUserValidation = {
  body: Joi.object<UserRegisterRequest>({
    user: Joi.object<UserRegisterRequest['user']>({
      email: Joi.string().email().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
    }).required(),
  }),
};

export const loginUserValidation = {
  body: Joi.object<UserLoginRequest>({
    user: Joi.object<UserLoginRequest['user']>({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }).required(),
  }),
};
