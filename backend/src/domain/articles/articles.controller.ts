import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { authMiddleware } from '../../middlewares';
import { slugify } from '../../helpers';
import { Article } from './article.model';
import { createArticleValidation } from './article.validation';

import type { Controller } from '../../interfaces';
import type { ArticleCreateRequest, ArticleResponse } from './article.types';

export class ArticlesController implements Controller {
  public path: Controller['path'] = '/articles';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware(), validate(createArticleValidation), this.createArticle);
  }

  private createArticle: RequestHandler<never, ArticleResponse, ArticleCreateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { article: articlePayload } = request.body;

    try {
      const article = await Article.create({
        ...articlePayload,
        slug: slugify(articlePayload.title),
        author: currentUser!.id,
      });

      const user = await article.getUser();

      response.send({
        article: {
          ...article.createArticlePayload(),
          favorited: false,
          author: {
            ...user.createProfilePayload(),
            following: false,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
