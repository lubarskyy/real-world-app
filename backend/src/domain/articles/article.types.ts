import { ArticleAttributes, ArticlePayload } from './article.model';
import { ProfileResponse } from '../profiles';

export type ArticleParams = {
  slug: ArticleAttributes['slug'];
};

export type ArticleCreateRequest = {
  article: Pick<ArticleAttributes, 'title' | 'description' | 'body' | 'tagList'>;
};

export type ArticleUpdateRequest = {
  article: Partial<Pick<ArticleAttributes, 'title' | 'description' | 'body'>>;
};

export type ArticleResponse = {
  article: ArticlePayload & {
    favorited: boolean;
    author: ProfileResponse['profile'];
  };
};
