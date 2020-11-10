import { Request } from 'express';
import { slugify } from '../../helpers';
import { Follow } from '../profiles';
import { Article } from './article.model';
import { Favourite } from './favourite.model';

import type { ArticleParams, ArticleCreateRequest, ArticleUpdateRequest, ArticleResponse } from './article.types';

export class ArticleService {
  public createArticle = async (
    request: Request<ArticleParams, never, ArticleCreateRequest, never>,
  ): Promise<ArticleResponse> => {
    const { currentUser } = request;
    const payload = request.body.article;

    const article = await Article.create({
      ...payload,
      slug: slugify(payload.title),
      author: currentUser!.id,
    });

    const user = await article.getUser();

    return {
      article: {
        ...article.createArticlePayload(),
        favorited: false,
        author: {
          ...user.createProfilePayload(),
          following: false,
        },
      },
    };
  };

  public fetchArticle = async (
    request: Request<ArticleParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug } });

    if (article) {
      const user = await article.getUser();

      const isFollowing = currentUser
        ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: user.id } }))
        : false;
      const isFavorited = currentUser
        ? Boolean(await Favourite.findOne({ where: { favouriteSource: currentUser.id, favouriteTarget: user.id } }))
        : false;

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: isFavorited,
          author: {
            ...user.createProfilePayload(),
            following: isFollowing,
          },
        },
      };
    } else {
      return null;
    }
  };

  public updateArticle = async (
    request: Request<ArticleParams, never, ArticleUpdateRequest, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;
    const payload = request.body.article;

    const article = await Article.findOne({ where: { slug } });

    if (article) {
      const user = await article.getUser();
      const hasTitleChanged = payload.title ? payload.title !== article.title : false;

      await article
        .set({
          ...payload,
          ...(hasTitleChanged && { slug: slugify(payload.title!) }),
        })
        .save();

      const isFollowing = Boolean(
        await Follow.findOne({ where: { followerId: currentUser!.id, followingId: user.id } }),
      );
      const isFavorited = Boolean(
        await Favourite.findOne({ where: { favouriteSource: currentUser!.id, favouriteTarget: user.id } }),
      );

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: isFavorited,
          author: {
            ...user.createProfilePayload(),
            following: isFollowing,
          },
        },
      };
    } else {
      return null;
    }
  };

  public deleteArticle = async (request: Request<ArticleParams, never, never, never>): Promise<number> => {
    const { slug } = request.params;

    return await Article.destroy({ where: { slug }, limit: 1 });
  };
}
