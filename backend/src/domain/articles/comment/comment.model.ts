import { Sequelize, Model, DataTypes, Association, BelongsToGetAssociationMixin } from 'sequelize';
import { User, UserAttributes } from '../../users';
import { Article, ArticleAttributes } from '../article.model';

export type CommentAttributes = {
  id: string;
  body: string;
  // association foreign keys
  authorId?: UserAttributes['id'];
  articleId?: ArticleAttributes['id'];
};

export type CommentCreationAttributes = Omit<CommentAttributes, 'id'> & {
  authorId: UserAttributes['id'];
  articleId: ArticleAttributes['id'];
};

export type CommentPayload = Omit<CommentAttributes, 'authorId' | 'articleId'> & {
  createdAt: Comment['createdAt'];
  updatedAt: Comment['updatedAt'];
};

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: CommentAttributes['id'];
  public body!: CommentAttributes['body'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public readonly article?: Article;

  public static associations: {
    user: Association<Comment, User>;
    article: Association<Comment, Article>;
  };

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getArticle!: BelongsToGetAssociationMixin<User>;

  public createCommentPayload(): CommentPayload {
    return {
      id: this.id,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const initCommentModel = (sequelize: Sequelize): void => {
  Comment.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      body: {
        type: DataTypes.TEXT(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    { sequelize, tableName: 'Comments' },
  );
};

export const initCommentAssociations = () => {
  Comment.belongsTo(User, {
    foreignKey: {
      name: 'authorId',
      allowNull: false,
    },
    as: 'user',
  });

  Comment.belongsTo(Article, {
    foreignKey: {
      name: 'articleId',
      allowNull: false,
    },
    as: 'article',
  });
};
