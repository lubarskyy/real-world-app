import express from 'express';
import bodyParser from 'body-parser';
import { Sequelize } from 'sequelize';
import { Controller } from './interfaces';

export class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.connectToDatabse();
  }

  public listen(): void {
    this.app.listen(this.port, () => console.log(`Application initialized and is listening on port ${this.port}.`));
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers: Controller[]): void {
    for (const controller of controllers) {
      this.app.use('/api', controller.router);
    }
  }

  private async connectToDatabse(): Promise<void> {
    const sequelize = new Sequelize({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      dialect: 'postgres',
    });

    try {
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
    } catch (err) {
      console.log("Database connection couldn't been established.", err);
    }
  }
}
