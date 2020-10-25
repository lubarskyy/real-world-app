import { ArticleAttributes, ArticlePayload } from './article.model';
import { ProfileResponse } from '../profiles';

export type ArticleParams = {
  slug: ArticleAttributes['slug'];
};

export type ArticleCreateRequest = {
  article: Pick<ArticleAttributes, 'title' | 'description' | 'body' | 'tagList'>;
};

export type ArticleResponse = {
  article: ArticlePayload & {
    favorited: boolean;
    author: ProfileResponse['profile'];
  };
};
