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
      authorId: currentUser!.id,
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

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    if (article) {
      const isFollowing = currentUser
        ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: article.user!.id } }))
        : false;
      const isFavorited = currentUser
        ? Boolean(await Favourite.findOne({ where: { favouriteSource: currentUser.id, favouriteTarget: article.id } }))
        : false;

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: isFavorited,
          author: {
            ...article.user!.createProfilePayload(),
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

    const article = await Article.findOne({
      where: { slug, authorId: currentUser!.id },
      include: Article.associations.user,
    });

    if (article) {
      const hasTitleChanged = payload.title ? payload.title !== article.title : false;

      await article
        .set({
          ...payload,
          ...(hasTitleChanged && { slug: slugify(payload.title!) }),
        })
        .save();

      const isFollowing = Boolean(
        await Follow.findOne({ where: { followerId: currentUser!.id, followingId: article.user!.id } }),
      );
      const isFavorited = Boolean(
        await Favourite.findOne({ where: { favouriteSource: currentUser!.id, favouriteTarget: article.id } }),
      );

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: isFavorited,
          author: {
            ...article.user!.createProfilePayload(),
            following: isFollowing,
          },
        },
      };
    } else {
      return null;
    }
  };

  public deleteArticle = async (request: Request<ArticleParams, never, never, never>): Promise<boolean> => {
    const { currentUser } = request;
    const { slug } = request.params;

    return Boolean(await Article.destroy({ where: { slug, authorId: currentUser!.id }, limit: 1 }));
  };

  public favoriteArticle = async (
    request: Request<ArticleParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    if (article) {
      await Favourite.create({ favouriteSource: currentUser!.id, favouriteTarget: article.id });

      await article.increment('favoritesCount');
      await article.reload();

      const isFollowing = Boolean(
        await Follow.findOne({ where: { followerId: currentUser!.id, followingId: article.user!.id } }),
      );

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: true,
          author: {
            ...article.user!.createProfilePayload(),
            following: isFollowing,
          },
        },
      };
    } else {
      return null;
    }
  };

  public unfavoriteArticle = async (
    request: Request<ArticleParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    if (article) {
      await Favourite.destroy({ where: { favouriteSource: currentUser!.id, favouriteTarget: article.id } });

      await article.decrement('favoritesCount');
      await article.reload();

      const isFollowing = Boolean(
        await Follow.findOne({ where: { followerId: currentUser!.id, followingId: article.user!.id } }),
      );

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: false,
          author: {
            ...article.user!.createProfilePayload(),
            following: isFollowing,
          },
        },
      };
    } else {
      return null;
    }
  };
}
