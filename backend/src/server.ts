import bodyParser from 'body-parser';
import { Application } from './app';
import { Database } from './database';
import { UsersController, initUserModel } from './users';

const initializers = [initUserModel];
const database = new Database(initializers);

const controllers = [new UsersController()];
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
