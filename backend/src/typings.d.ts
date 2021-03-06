declare namespace NodeJS {
  export interface ProcessEnv {
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;

    EXPRESS_SERVER_PORT: string;
    JWT_SECRET: string;
  }
}

declare namespace Express {
  import('./domain/users');
  import { UserAttributes } from './domain/users';

  export interface Request {
    currentUser?: {
      id: UserAttributes['id'];
      username: UserAttributes['username'];
      token: string;
    };
  }
}
