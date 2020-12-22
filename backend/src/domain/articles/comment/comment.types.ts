import { CommentAttributes, CommentPayload } from './comment.model';
import { ProfileResponse } from '../../profiles';

export type CommentCreateRequest = {
  comment: Pick<CommentAttributes, 'body'>;
};

export type CommentResponse = {
  comment: CommentPayload & {
    author: ProfileResponse['profile'];
  };
};
