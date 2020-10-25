import { Router, RequestHandler } from 'express';
import { validate } from 'express-validation';
import { authMiddleware } from '../../middlewares';
import { NotFoundException } from '../../exceptions';
import { slugify } from '../../helpers';
import { Follow } from '../profiles';
import { Article } from './article.model';
import { Favourite } from './favourite.model';
import { createArticleValidation, updateArticleValidation } from './article.validation';

import type { Controller } from '../../interfaces';
import type { ArticleParams, ArticleCreateRequest, ArticleUpdateRequest, ArticleResponse } from './article.types';

export class ArticlesController implements Controller {
  public path: Controller['path'] = '/articles';
  public router: Controller['router'] = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(`${this.path}`, authMiddleware(), validate(createArticleValidation), this.createArticle);
    this.router.get(`${this.path}/:slug`, authMiddleware({ optional: true }), this.fetchArticle);
    this.router.put(`${this.path}/:slug`, authMiddleware(), validate(updateArticleValidation), this.updateArticle);
  }

  private createArticle: RequestHandler<never, ArticleResponse, ArticleCreateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const payload = request.body.article;

    try {
      const article = await Article.create({
        ...payload,
        slug: slugify(payload.title),
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
      const article = await Article.findOne({ where: { slug } });
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

  private updateArticle: RequestHandler<ArticleParams, ArticleResponse, ArticleUpdateRequest, never> = async (
    request,
    response,
    next,
  ): Promise<void> => {
    const { currentUser } = request;
    const { slug } = request.params;
    const payload = request.body.article;

    try {
      const article = await Article.findOne({ where: { slug } });

      if (article) {
        const user = await article.getUser();
        const isTitleChanged = payload.title ? article.title !== payload.title : false;

        await article
          .set({
            ...payload,
            ...(isTitleChanged && { slug: slugify(payload.title!) }),
          })
          .save();

        const isFollowing = Boolean(
          await Follow.findOne({ where: { followerId: currentUser!.id, followingId: user.id } }),
        );
        const isFavorited = Boolean(
          await Favourite.findOne({ where: { favouriteSource: currentUser!.id, favouriteTarget: user.id } }),
        );

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
