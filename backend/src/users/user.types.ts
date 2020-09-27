import { UserAttributes, UserPayload } from './user.model';

export type UserRegisterRequest = {
  user: Pick<UserAttributes, 'email' | 'username' | 'password'>;
};

export type UserLoginRequest = {
  user: Pick<UserAttributes, 'email' | 'password'>;
};

export type UserResponse = {
  user: UserPayload & {
    token: string;
  };
};
