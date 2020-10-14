import bodyParser from 'body-parser';
import { Application } from './app';
import { Database } from './database';
import { AuthenticationService } from './services';
import { initUserModel, UsersController } from './domain/users';
import { initFollowModel, ProfilesController } from './domain/profiles';

const initializers = [initUserModel, initFollowModel];
const database = new Database(initializers);

const controllers = [new UsersController(AuthenticationService), new ProfilesController()];
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
