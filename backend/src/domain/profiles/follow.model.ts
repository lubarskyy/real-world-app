import { Sequelize, Model, DataTypes } from 'sequelize';
import { UserAttributes } from '../users';

export type FollowAttributes = {
  id: string;
  followSource: UserAttributes['id'];
  followTarget: UserAttributes['id'];
};

export type FollowCreationAttributes = Omit<FollowAttributes, 'id'>;

export class Follow extends Model<FollowAttributes, FollowCreationAttributes> implements FollowAttributes {
  public id!: FollowAttributes['id'];
  public followSource!: FollowAttributes['followSource'];
  public followTarget!: FollowAttributes['followTarget'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export const initFollowModel = (sequelize: Sequelize): void => {
  Follow.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      followSource: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'uniquePairIndex',
        validate: {
          notEmpty: true,
        },
      },
      followTarget: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: 'uniquePairIndex',
        validate: {
          notEmpty: true,
        },
      },
    },
    { sequelize, tableName: 'Follows' },
  );
};
