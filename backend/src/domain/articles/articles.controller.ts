import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { authMiddleware } from '../../middlewares';
import { NotFoundException } from '../../exceptions';
import { slugify } from '../../helpers';
import { Follow } from '../profiles';
import { Article } from './article.model';
import { Favourite } from './favourite.model';
import { createArticleValidation } from './article.validation';

import type { Controller } from '../../interfaces';
import type { ArticleParams, ArticleCreateRequest, ArticleResponse } from './article.types';

export class ArticlesController implements Controller {
  public path: Controller['path'] = '/articles';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware(), validate(createArticleValidation), this.createArticle);
    this.router.get(`${this.path}/:slug`, authMiddleware({ optional: true }), this.fetchArticle);
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

  private fetchArticle: RequestHandler<ArticleParams, ArticleResponse, never, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { slug } = request.params;

    try {
      const article = await Article.findByPk(slug);
      const user = await article?.getUser();

      if (article && user) {
        const isFollowing = currentUser
          ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: user.id } }))
          : false;
        const isFavorited = currentUser
          ? Boolean(await Favourite.findOne({ where: { favouriteSource: currentUser.id, favouriteTarget: user.id } }))
          : false;

        response.send({
          article: {
            ...article.createArticlePayload(),
            favorited: isFavorited,
            author: {
              ...user.createProfilePayload(),
              following: isFollowing,
            },
          },
        });
      } else {
        next(new NotFoundException("Article doesn't exist."));
      }
    } catch (error) {
      next(error);
    }
  };
}
