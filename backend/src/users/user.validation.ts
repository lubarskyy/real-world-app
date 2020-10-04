import { Joi } from 'express-validation';
import { UserRegisterRequest, UserLoginRequest, UserEditRequest } from './user.types';

export const reqisterUserValidation = {
  body: Joi.object<UserRegisterRequest>({
    user: Joi.object<UserRegisterRequest['user']>({
      email: Joi.string().email().required(),
      username: Joi.string().required().max(30),
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

export const editUserValidation = {
  body: Joi.object<UserEditRequest>({
    user: Joi.object<UserEditRequest['user']>({
      email: Joi.string().email(),
      username: Joi.string().max(30),
      password: Joi.string(),
      bio: Joi.string(),
      image: Joi.string(),
    })
      .required()
      .min(1),
  }),
};
