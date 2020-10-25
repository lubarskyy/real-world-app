import bodyParser from 'body-parser';
import { Application } from './app';
import { Database } from './database';
import { AuthenticationService } from './services';
import { initUserModel, initUserAssociations, UsersController } from './domain/users';
import { initFollowModel, ProfilesController } from './domain/profiles';
import { initArticleModel, initFavouriteModel, initArticleAssociations, ArticlesController } from './domain/articles';

/**
 * Database
 */
const modelInitializers = [initUserModel, initFollowModel, initArticleModel, initFavouriteModel];
const associationInitializers = [initUserAssociations, initArticleAssociations];

const database = new Database(modelInitializers, associationInitializers);

/**
 * Application
 */
const controllers = [new UsersController(AuthenticationService), new ProfilesController(), new ArticlesController()];
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
