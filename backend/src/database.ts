import { Sequelize } from 'sequelize';

type ModelInitializer = (sequelize: Sequelize) => void;
type AssociationInitializer = () => void;

export class Database {
  public connection: Sequelize;

  constructor(modelInitializers: ModelInitializer[], associationInitializers: AssociationInitializer[]) {
    this.connection = new Sequelize({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      dialect: 'postgres',
      quoteIdentifiers: false,
    });

    for (const modelInitializer of modelInitializers) {
      modelInitializer(this.connection);
    }

    for (const associationInitializer of associationInitializers) {
      associationInitializer();
    }
  }

  public async authenticate(): Promise<unknown> {
    try {
      await this.connection.authenticate();
      console.log('Database connection established successfully.');
    } catch (error) {
      console.log("Database connection couldn't been established.", error);
      return Promise.reject(error);
    }
  }

  public async synchronize(): Promise<unknown> {
    try {
      await this.connection.sync();
      console.log('Database models synchronized successfully.');
    } catch (error) {
      console.log("Database models couldn't been synchronized.", error);
      return Promise.reject(error);
    }
  }
}
