import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { authMiddleware } from '../../middlewares';
import { NotFoundException } from '../../exceptions';
import { createArticleValidation, updateArticleValidation } from './article.validation';
import { createCommentValidation } from './comment';

import type { Controller } from '../../interfaces';
import type { ArticleService } from './article.service';
import type {
  ArticlePathParams,
  ArticleQueryParams,
  ArticleFeedQueryParams,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  ArticleResponse,
  ArticlesResponse,
} from './article.types';
import type { CommentCreateRequest, CommentResponse, CommentsResponse } from './comment';

export class ArticlesController implements Controller {
  public path: Controller['path'] = '/articles';
  public router: Controller['router'] = Router();

  private readonly articleService: ArticleService;
  private readonly articleNotFoundException: NotFoundException;

  constructor(articleService: typeof ArticleService) {
    this.articleService = new articleService();
    this.articleNotFoundException = new NotFoundException("Article doesn't exist.");
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(this.path, authMiddleware({ optional: true }), this.fetchArticles);
    this.router.get(`${this.path}/feed`, authMiddleware(), this.fetchFeedArticles);

    this.router.post(this.path, authMiddleware(), validate(createArticleValidation), this.createArticle);
    this.router.get(`${this.path}/:slug`, authMiddleware({ optional: true }), this.fetchArticle);
    this.router.put(`${this.path}/:slug`, authMiddleware(), validate(updateArticleValidation), this.updateArticle);
    this.router.delete(`${this.path}/:slug`, authMiddleware(), this.deleteArticle);

    this.router.post(
      `${this.path}/:slug/comments`,
      authMiddleware(),
      validate(createCommentValidation),
      this.createArticleComment,
    );
    this.router.get(`${this.path}/:slug/comments`, authMiddleware({ optional: true }), this.fetchArticleComments);

    this.router.post(`${this.path}/:slug/favorite`, authMiddleware(), this.favoriteArticle);
    this.router.delete(`${this.path}/:slug/favorite`, authMiddleware(), this.unfavoriteArticle);
  }

  private fetchArticles: RequestHandler<never, ArticlesResponse, never, ArticleQueryParams> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const fetchedArticles = await this.articleService.fetchArticles(request);

      response.send(fetchedArticles);
    } catch (error) {
      next(error);
    }
  };

  private fetchFeedArticles: RequestHandler<never, ArticlesResponse, never, ArticleFeedQueryParams> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const fetchedFeedArticles = await this.articleService.fetchFeedArticles(request);

      response.send(fetchedFeedArticles);
    } catch (error) {
      next(error);
    }
  };

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

  private fetchArticle: RequestHandler<ArticlePathParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const fetchedArticle = await this.articleService.fetchArticle(request);

      if (fetchedArticle) {
        response.send(fetchedArticle);
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };

  private updateArticle: RequestHandler<ArticlePathParams, ArticleResponse, ArticleUpdateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const updatedArticle = await this.articleService.updateArticle(request);

      if (updatedArticle) {
        response.send(updatedArticle);
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };

  private deleteArticle: RequestHandler<ArticlePathParams, never, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const isArticleDeleted = await this.articleService.deleteArticle(request);

      if (isArticleDeleted) {
        response.status(200).send();
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };

  private createArticleComment: RequestHandler<
    ArticlePathParams,
    CommentResponse,
    CommentCreateRequest,
    never
  > = async (request, response, next): Promise<void> => {
    try {
      const createdComment = await this.articleService.createArticleComment(request);

      if (createdComment) {
        response.send(createdComment);
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };

  private fetchArticleComments: RequestHandler<ArticlePathParams, CommentsResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const fetchedComments = await this.articleService.fetchArticleComments(request);

      response.send(fetchedComments);
    } catch (error) {
      next(error);
    }
  };

  private favoriteArticle: RequestHandler<ArticlePathParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const favouritedArticle = await this.articleService.favoriteArticle(request);

      if (favouritedArticle) {
        response.send(favouritedArticle);
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };

  private unfavoriteArticle: RequestHandler<ArticlePathParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    try {
      const unfavouritedArticle = await this.articleService.unfavoriteArticle(request);

      if (unfavouritedArticle) {
        response.send(unfavouritedArticle);
      } else {
        next(this.articleNotFoundException);
      }
    } catch (error) {
      next(error);
    }
  };
}
