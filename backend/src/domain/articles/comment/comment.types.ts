import { CommentAttributes, CommentPayload } from './comment.model';
import { ProfileResponse } from '../../profiles';

export type CommentCreateRequest = {
  comment: Pick<CommentAttributes, 'body'>;
};

type ArticleComment = CommentPayload & {
  author: ProfileResponse['profile'];
};

export type CommentResponse = {
  comment: ArticleComment;
};

export type CommentsResponse = {
  comments: ArticleComment[];
};
