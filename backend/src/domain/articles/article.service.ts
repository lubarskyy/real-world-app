import { Op, FindAndCountOptions } from 'sequelize';
import { Request } from 'express';
import { slugify } from '../../helpers';
import { UnprocessableEntityException } from '../../exceptions';
import { User } from '../users';
import { Follow } from '../profiles';
import { Article, ArticleAttributes } from './article.model';
import { Favourite } from './favourite.model';
import { Comment } from './comment';

import type {
  ArticlePathParams,
  ArticleQueryParams,
  ArticleFeedQueryParams,
  ArticleCreateRequest,
  ArticleUpdateRequest,
  ExtendedArticlePayload,
  ArticleResponse,
  ArticlesResponse,
} from './article.types';
import type { CommentCreateRequest, CommentResponse } from './comment';

// TODO: consider moving follow and favourite to user entity - as an array of ids

export class ArticleService {
  private readonly emptyArticlesResponse: ArticlesResponse = {
    articles: [],
    articlesCount: 0,
  };

  private isFavorited = async (currentUser: Request['currentUser'], article: Article): Promise<boolean> => {
    return currentUser
      ? Boolean(await Favourite.findOne({ where: { favouriteSource: currentUser.id, favouriteTarget: article.id } }))
      : false;
  };

  private isFollowing = async (currentUser: Request['currentUser'], author: User): Promise<boolean> => {
    return currentUser
      ? Boolean(await Follow.findOne({ where: { followSource: currentUser.id, followTarget: author.id } }))
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
    articles: {
      rows: Article[];
      count: number;
    },
  ): Promise<ArticlesResponse> => ({
    articles: await Promise.all(
      articles.rows.map((article) => this.createExtendedArticlePayload(currentUser, article)),
    ),
    articlesCount: articles.count,
  });

  public fetchArticles = async (
    request: Request<never, never, never, ArticleQueryParams>,
  ): Promise<ArticlesResponse> => {
    const { currentUser } = request;
    const { tag, author: authorUsername, favorited: favoritedByUsername, limit = 20, offset = 0 } = request.query;

    let queryOptions: FindAndCountOptions<ArticleAttributes> = {
      where: {},
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: {
        association: Article.associations.user,
      },
    };

    if (tag) {
      queryOptions.where = {
        ...queryOptions.where,
        tagList: { [Op.contains]: [tag] },
      };
    }

    if (authorUsername) {
      queryOptions.include = {
        ...(queryOptions.include as object),
        where: {
          username: authorUsername,
        },
      };
    }

    if (favoritedByUsername) {
      const user = await User.findOne({ where: { username: favoritedByUsername } });

      if (!user) {
        return this.emptyArticlesResponse;
      }

      const favourites = await Favourite.findAll({
        where: { favouriteSource: user.id },
      });

      queryOptions.where = {
        ...queryOptions.where,
        id: favourites.map((favourite) => favourite.favouriteTarget),
      };
    }

    const articles = await Article.findAndCountAll(queryOptions);

    return articles.count ? this.createArticlesResponse(currentUser, articles) : this.emptyArticlesResponse;
  };

  public fetchFeedArticles = async (
    request: Request<never, never, never, ArticleFeedQueryParams>,
  ): Promise<ArticlesResponse> => {
    const { currentUser } = request;
    const { limit = 20, offset = 0 } = request.query;

    const follows = await Follow.findAll({ where: { followSource: currentUser!.id } });

    const feedArticles = await Article.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: {
        association: Article.associations.user,
        where: { id: follows.map((follow) => follow.followTarget) },
      },
    });

    return feedArticles.count ? this.createArticlesResponse(currentUser, feedArticles) : this.emptyArticlesResponse;
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

  public createComment = async (
    request: Request<ArticlePathParams, never, CommentCreateRequest, never>,
  ): Promise<CommentResponse | null> => {
    const { currentUser } = request;
    const { slug } = request.params;
    const { body } = request.body.comment;

    const article = await Article.findOne({ where: { slug } });
    const user = await User.findOne({ where: { id: currentUser!.id } });

    if (article && user) {
      const comment = await Comment.create({
        body,
        authorId: user.id,
        articleId: article.id,
      });

      return {
        comment: {
          ...comment.createCommentPayload(),
          author: {
            ...user.createProfilePayload(),
            following: false,
          },
        },
      };
    } else {
      return null;
    }
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
      const destroyedFavouriteCount = await Favourite.destroy({
        where: { favouriteSource: currentUser!.id, favouriteTarget: article.id },
      });

      if (!destroyedFavouriteCount) {
        throw new UnprocessableEntityException('You cannot unfavourite this Article.');
      }

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
