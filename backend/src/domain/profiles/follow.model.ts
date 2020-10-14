import { Sequelize, Model, DataTypes } from 'sequelize';
import { UserAttributes } from '../users';

export type FollowAttributes = {
  id: string;
  followerId: UserAttributes['id'];
  followingId: UserAttributes['id'];
};

export type FollowCreationAttributes = Omit<FollowAttributes, 'id'>;

export class Follow extends Model<FollowAttributes, FollowCreationAttributes> implements FollowAttributes {
  public id!: FollowAttributes['id'];
  public followerId!: FollowAttributes['followerId'];
  public followingId!: FollowAttributes['followingId'];

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
      followerId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      followingId: {
        type: DataTypes.UUID,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    { sequelize },
  );
};
