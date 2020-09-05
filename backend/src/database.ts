import { Sequelize } from 'sequelize';

export class Database {
  public connection: Sequelize;

  constructor() {
    this.connection = new Sequelize({
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      dialect: 'postgres',
      quoteIdentifiers: false,
    });

    this.authenticate();
  }

  private async authenticate(): Promise<void> {
    try {
      await this.connection.authenticate;
      console.log('Database connection established successfully.');
    } catch (err) {
      console.log('Database connection cannot been established.', err);
    }
  }
}
