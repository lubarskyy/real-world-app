import { UserAttributes, UserPayload, ProfilePayload } from '../users';

export type ProfileParams = {
  username: UserAttributes['username'];
};

export type ProfileResponse = {
  profile: ProfilePayload & {
    following: boolean;
  };
};
