import { ArticleAttributes, ArticlePayload } from './article.model';
import { CommentAttributes } from './comment';
import { ProfileResponse } from '../profiles';

export type ArticlePathParams = {
  slug: ArticleAttributes['slug'];
};

export type ArticleCommentPathParams = ArticlePathParams & {
  commentId: CommentAttributes['id'];
};

export type ArticleFeedQueryParams = {
  limit?: number;
  offset?: number;
};

export type ArticleQueryParams = ArticleFeedQueryParams & {
  tag?: string;
  author?: string;
  favorited?: string;
};

export type ArticleCreateRequest = {
  article: Pick<ArticleAttributes, 'title' | 'description' | 'body' | 'tagList'>;
};

export type ArticleUpdateRequest = {
  article: Partial<Pick<ArticleAttributes, 'title' | 'description' | 'body'>>;
};

export type ExtendedArticlePayload = ArticlePayload & {
  favorited: boolean;
  author: ProfileResponse['profile'];
};

export type ArticleResponse = {
  article: ExtendedArticlePayload;
};

export type ArticlesResponse = {
  articles: ExtendedArticlePayload[];
  articlesCount: number;
};
