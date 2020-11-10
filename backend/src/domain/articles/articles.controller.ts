import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { authMiddleware } from '../../middlewares';
import { NotFoundException } from '../../exceptions';
import { createArticleValidation, updateArticleValidation } from './article.validation';

import type { Controller } from '../../interfaces';
import type { ArticleService } from './article.service';
import type { ArticleParams, ArticleCreateRequest, ArticleUpdateRequest, ArticleResponse } from './article.types';

export class ArticlesController implements Controller {
  public path: Controller['path'] = '/articles';
  public router: Controller['router'] = Router();

  private readonly articleService: ArticleService;
  private readonly articleNotFound: NotFoundException;

  constructor(articleService: typeof ArticleService) {
    this.articleService = new articleService();
    this.articleNotFound = new NotFoundException("Article doesn't exist.");
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware(), validate(createArticleValidation), this.createArticle);
    this.router.get(`${this.path}/:slug`, authMiddleware({ optional: true }), this.fetchArticle);
    this.router.put(`${this.path}/:slug`, authMiddleware(), validate(updateArticleValidation), this.updateArticle);
    this.router.delete(`${this.path}/:slug`, authMiddleware(), this.deleteArticle);

    this.router.post(`${this.path}/:slug/favorite`, authMiddleware(), this.favoriteArticle);
    this.router.delete(`${this.path}/:slug/favorite`, authMiddleware(), this.unfavoriteArticle);
  }

  private createArticle: RequestHandler<never, ArticleResponse, ArticleCreateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const createdArticle = await this.articleService.createArticle(request);

      response.send(createdArticle);
    } catch (error) {
      next(error);
    }
  };

  private fetchArticle: RequestHandler<ArticleParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const fetchedArticle = await this.articleService.fetchArticle(request);

      if (fetchedArticle) {
        response.send(fetchedArticle);
      } else {
        next(this.articleNotFound);
      }
    } catch (error) {
      next(error);
    }
  };

  private updateArticle: RequestHandler<ArticleParams, ArticleResponse, ArticleUpdateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const updatedArticle = await this.articleService.updateArticle(request);

      if (updatedArticle) {
        response.send(updatedArticle);
      } else {
        next(this.articleNotFound);
      }
    } catch (error) {
      next(error);
    }
  };

  private deleteArticle: RequestHandler<ArticleParams, never, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const isArticleDeleted = await this.articleService.deleteArticle(request);

      if (isArticleDeleted) {
        response.status(200).send();
      } else {
        next(this.articleNotFound);
      }
    } catch (error) {
      next(error);
    }
  };

  private favoriteArticle: RequestHandler<ArticleParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const favouritedArticle = await this.articleService.favoriteArticle(request);

      if (favouritedArticle) {
        response.send(favouritedArticle);
      } else {
        next(this.articleNotFound);
      }
    } catch (error) {
      next(error);
    }
  };

  private unfavoriteArticle: RequestHandler<ArticleParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const unfavouritedArticle = await this.articleService.unfavoriteArticle(request);

      if (unfavouritedArticle) {
        response.send(unfavouritedArticle);
      } else {
        next(this.articleNotFound);
      }
    } catch (error) {
      next(error);
    }
  };
}
