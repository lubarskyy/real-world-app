import { Sequelize, Model, DataTypes } from 'sequelize';

export type UserAttributes = {
  id: string;
  email: string;
  username: string;
  password: string;
  bio?: string | null;
  image?: string | null;
};

export type UserCreationAttributes = Omit<UserAttributes, 'id'>;
export type UserPayload = Omit<UserAttributes, 'password'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: UserAttributes['id'];
  public email!: UserAttributes['email'];
  public username!: UserAttributes['username'];
  public password!: UserAttributes['password'];
  public bio: UserAttributes['bio'];
  public image: UserAttributes['image'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public createUserPayload(): UserPayload {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      bio: this.bio,
      image: this.image,
    };
  }
}

export const initUserModel = (sequelize: Sequelize): void => {
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          notEmpty: true,
          isEmail: true,
        },
      },
      username: {
        type: DataTypes.STRING(30),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      bio: {
        type: DataTypes.TEXT,
      },
      image: {
        type: DataTypes.STRING,
      },
    },
    { sequelize },
  );
};
