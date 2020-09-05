import { App } from './app';
import { Database } from './database';

const database = new Database();
const server = new App([], Number(process.env.EXPRESS_SERVER_PORT));

server.listen();
