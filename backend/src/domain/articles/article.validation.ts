import { Joi } from 'express-validation';
import { ArticleCreateRequest, ArticleUpdateRequest } from './article.types';

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

export const updateArticleValidation = {
  body: Joi.object<ArticleUpdateRequest>({
    article: Joi.object<ArticleUpdateRequest['article']>({
      title: Joi.string().max(50),
      description: Joi.string(),
      body: Joi.string(),
    })
      .required()
      .min(1),
  }),
};
