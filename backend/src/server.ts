import bodyParser from 'body-parser';
import { Application } from './app';
import { Database } from './database';
import { AuthenticationService } from './services';
import { initUserModel, initUserAssociations, UsersController } from './domain/users';
import { initFollowModel, ProfilesController } from './domain/profiles';
import {
  initArticleModel,
  initCommentModel,
  initFavouriteModel,
  initArticleAssociations,
  initCommentAssociations,
  ArticlesController,
  ArticleService,
} from './domain/articles';

/**
 * Database
 */
const modelInitializers = [initUserModel, initFollowModel, initArticleModel, initCommentModel, initFavouriteModel];
const associationInitializers = [initUserAssociations, initArticleAssociations, initCommentAssociations];

const database = new Database(modelInitializers, associationInitializers);

/**
 * Application
 */
const controllers = [
  new UsersController(AuthenticationService),
  new ProfilesController(),
  new ArticlesController(ArticleService),
];
const middlewares = [bodyParser.json()];

const server = new Application(controllers, middlewares, process.env.EXPRESS_SERVER_PORT);

(async () => {
  try {
    await database.authenticate();
    await database.synchronize();

    server.listen();
  } catch (error) {
    console.error(error);
  }
})();
