import { Joi } from 'express-validation';
import { ArticleCreateRequest } from './article.types';

export const createArticleValidation = {
  body: Joi.object<ArticleCreateRequest>({
    article: Joi.object<ArticleCreateRequest['article']>({
      title: Joi.string().required().max(50),
      description: Joi.string().required(),
      body: Joi.string().required(),
      tagList: Joi.array().items(Joi.string().max(20)),
    }).required(),
  }),
};
