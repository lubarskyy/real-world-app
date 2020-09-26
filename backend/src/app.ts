import express from 'express';
import { errorMiddleware } from './middlewares';
import { Controller } from './interfaces';

export class Application {
  public app: express.Application;
  public port: string;

  constructor(controllers: Controller[], middlewares: express.RequestHandler[], port: string) {
    this.app = express();
    this.port = port;

    this.initializeMiddlewares(middlewares);
    this.initializeControllers(controllers);
  }

  public listen(): void {
    this.app.listen(Number(this.port), () =>
      console.log(`Express server initialized and is listening on port ${this.port}.`),
    );
  }

  private initializeMiddlewares(middlewares: express.RequestHandler[]): void {
    for (const middleware of middlewares) {
      this.app.use(middleware);
    }
  }

  private initializeControllers(controllers: Controller[]): void {
    for (const controller of controllers) {
      this.app.use('/api', controller.router, errorMiddleware);
    }
  }
}
