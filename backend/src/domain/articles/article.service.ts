import { Op } from 'sequelize';
import { Request } from 'express';
import { slugify } from '../../helpers';
import { User } from '../users';
import { Follow } from '../profiles';
import { Article } from './article.model';
import { Favourite } from './favourite.model';

import type {
  ArticlePathParams,
  ArticleQueryParams,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  ExtendedArticlePayload,
  ArticleResponse,
  ArticlesResponse,
} from './article.types';

// TODO: consider moving follow and favourite to user entity - as array of ids

export class ArticleService {
  private isFavorited = async (currentUser: Request['currentUser'], article: Article): Promise<boolean> => {
    return currentUser
      ? Boolean(await Favourite.findOne({ where: { favouriteSource: currentUser.id, favouriteTarget: article.id } }))
      : false;
  };

  private isFollowing = async (currentUser: Request['currentUser'], author: User): Promise<boolean> => {
    return currentUser
      ? Boolean(await Follow.findOne({ where: { followerId: currentUser.id, followingId: author.id } }))
      : false;
  };

  private createExtendedArticlePayload = async (
    currentUser: Request['currentUser'],
    article: Article,
  ): Promise<ExtendedArticlePayload> => {
    const favorited = await this.isFavorited(currentUser, article);
    const following = await this.isFollowing(currentUser, article.user!);

    return {
      ...article.createArticlePayload(),
      favorited,
      author: {
        ...article.user!.createProfilePayload(),
        following,
      },
    };
  };

  private createArticlesResponse = async (
    currentUser: Request['currentUser'],
    fetchedArticles: {
      rows: Article[];
      count: number;
    },
  ): Promise<ArticlesResponse> => ({
    articles: await Promise.all(
      fetchedArticles.rows.map((article) => this.createExtendedArticlePayload(currentUser, article)),
    ),
    articlesCount: fetchedArticles.count,
  });

  public fetchArticles = async (
    request: Request<never, never, never, ArticleQueryParams>,
  ): Promise<ArticlesResponse> => {
    const { currentUser } = request;
    const { tag, author: authorUsername, favorited: favoritedByUsername, limit, offset } = request.query;

    const emptyResponse = {
      articles: [],
      articlesCount: 0,
    };

    if (tag) {
      const fetchedArticles = await Article.findAndCountAll({
        where: { tagList: { [Op.contains]: [tag] } },
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: Article.associations.user,
      });

      return this.createArticlesResponse(currentUser, fetchedArticles);
    }

    if (authorUsername) {
      const fetchedArticles = await Article.findAndCountAll({
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        include: {
          association: Article.associations.user,
          where: {
            username: authorUsername,
          },
        },
      });

      return this.createArticlesResponse(currentUser, fetchedArticles);
    }

    if (favoritedByUsername) {
      const user = await User.findOne({ where: { username: favoritedByUsername } });

      if (user) {
        const favourites = await Favourite.findAll({
          where: { favouriteSource: user.id },
        });

        const fetchedArticles = await Article.findAndCountAll({
          where: { id: favourites.map((favourite) => favourite.favouriteTarget) },
          limit,
          offset,
          order: [['createdAt', 'DESC']],
          include: Article.associations.user,
        });

        return this.createArticlesResponse(currentUser, fetchedArticles);
      }

      return emptyResponse;
    }

    const fetchedArticles = await Article.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: Article.associations.user,
    });

    return fetchedArticles.count ? this.createArticlesResponse(currentUser, fetchedArticles) : emptyResponse;
  };

  public createArticle = async (
    request: Request<ArticlePathParams, never, ArticleCreateRequest, never>,
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
    request: Request<ArticlePathParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    return article
      ? {
          article: await this.createExtendedArticlePayload(currentUser, article),
        }
      : null;
  };

  public updateArticle = async (
    request: Request<ArticlePathParams, never, ArticleUpdateRequest, never>,
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

      return {
        article: await this.createExtendedArticlePayload(currentUser, article),
      };
    } else {
      return null;
    }
  };

  public deleteArticle = async (request: Request<ArticlePathParams, never, never, never>): Promise<boolean> => {
    const { currentUser } = request;
    const { slug } = request.params;

    return Boolean(await Article.destroy({ where: { slug, authorId: currentUser!.id }, limit: 1 }));
  };

  public favoriteArticle = async (
    request: Request<ArticlePathParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    if (article) {
      await Favourite.create({ favouriteSource: currentUser!.id, favouriteTarget: article.id });

      await article.increment('favoritesCount');
      await article.reload();

      const following = await this.isFollowing(currentUser, article.user!);

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: true,
          author: {
            ...article.user!.createProfilePayload(),
            following,
          },
        },
      };
    } else {
      return null;
    }
  };

  public unfavoriteArticle = async (
    request: Request<ArticlePathParams, never, never, never>,
  ): Promise<ArticleResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;

    const article = await Article.findOne({ where: { slug }, include: Article.associations.user });

    if (article) {
      await Favourite.destroy({ where: { favouriteSource: currentUser!.id, favouriteTarget: article.id } });

      await article.decrement('favoritesCount');
      await article.reload();

      const following = await this.isFollowing(currentUser, article.user!);

      return {
        article: {
          ...article.createArticlePayload(),
          favorited: false,
          author: {
            ...article.user!.createProfilePayload(),
            following,
          },
        },
      };
    } else {
      return null;
    }
  };
}
