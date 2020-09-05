import express from 'express';
import bodyParser from 'body-parser';
import { Controller } from './interfaces';

export class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[], port: number) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares();
    this.initializeControllers(controllers);
  }

  public listen(): void {
    this.app.listen(this.port, () => console.log(`Express server initialized and is listening on port ${this.port}.`));
  }

  private initializeMiddlewares(): void {
    this.app.use(bodyParser.json());
  }

  private initializeControllers(controllers: Controller[]): void {
    for (const controller of controllers) {
      this.app.use('/api', controller.router);
    }
  }
}
