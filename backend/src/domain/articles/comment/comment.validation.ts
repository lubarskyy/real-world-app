import { Joi } from 'express-validation';
import { CommentCreateRequest } from './comment.types';

export const createCommentValidation = {
  body: Joi.object<CommentCreateRequest>({
    comment: Joi.object<CommentCreateRequest['comment']>({
      body: Joi.string().required(),
    }).required(),
  }),
};
