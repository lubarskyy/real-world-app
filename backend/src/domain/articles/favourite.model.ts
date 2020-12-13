import { Sequelize, Model, DataTypes } from 'sequelize';
import { UserAttributes } from '../users';
import { ArticleAttributes } from '../articles';

export type FavouriteAttributes = {
  id: string;
  favouriteSource: UserAttributes['id'];
  favouriteTarget: ArticleAttributes['id'];
};

export type FavouriteCreationAttributes = Omit<FavouriteAttributes, 'id'>;

export class Favourite extends Model<FavouriteAttributes, FavouriteCreationAttributes> implements FavouriteAttributes {
  public id!: FavouriteAttributes['id'];
  public favouriteSource!: FavouriteAttributes['favouriteSource'];
  public favouriteTarget!: FavouriteAttributes['favouriteTarget'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initFavouriteModel = (sequelize: Sequelize): void => {
  Favourite.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      favouriteSource: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'uniquePairIndex',
        validate: {
          notEmpty: true,
        },
      },
      favouriteTarget: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'uniquePairIndex',
        validate: {
          notEmpty: true,
        },
      },
    },
    { sequelize, tableName: 'Favourites' },
  );
};
