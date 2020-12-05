import { ArticleAttributes, ArticlePayload } from './article.model';
import { ProfileResponse } from '../profiles';

export type ArticlePathParams = {
  slug: ArticleAttributes['slug'];
};

export type ArticleQueryParams = {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
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
