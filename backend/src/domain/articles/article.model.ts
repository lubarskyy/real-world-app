import {
  Sequelize,
  Model,
  DataTypes,
  Association,
  BelongsToGetAssociationMixin,
  HasManyGetAssociationsMixin,
} from 'sequelize';
import { Comment, CommentAttributes } from './comment';
import { User, UserAttributes } from '../users';

export type ArticleAttributes = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  favoritesCount?: number;
  // association foreign keys
  authorId?: UserAttributes['id'];
  commentsIds?: CommentAttributes['id'][];
};
export type ArticleCreationAttributes = Omit<ArticleAttributes, 'id' | 'favoritesCount'> & {
  authorId: UserAttributes['id'];
};

export type ArticlePayload = Omit<ArticleAttributes, 'id' | 'authorId'> & {
  createdAt: Article['createdAt'];
  updatedAt: Article['updatedAt'];
};

export class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: ArticleAttributes['id'];
  public slug!: ArticleAttributes['slug'];
  public title!: ArticleAttributes['title'];
  public description!: ArticleAttributes['description'];
  public body!: ArticleAttributes['body'];
  public tagList: ArticleAttributes['tagList'];
  public favoritesCount: ArticleAttributes['favoritesCount'];
  public authorId: ArticleAttributes['authorId'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public readonly comments?: Comment[];

  public static associations: {
    user: Association<Article, User>;
    comments: Association<Article, Comment>;
  };

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getComments!: HasManyGetAssociationsMixin<Comment>;

  public createArticlePayload(): ArticlePayload {
    return {
      slug: this.slug,
      title: this.title,
      description: this.description,
      body: this.body,
      tagList: this.tagList,
      favoritesCount: this.favoritesCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

export const initArticleModel = (sequelize: Sequelize): void => {
  Article.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      slug: {
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      title: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.TEXT(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      body: {
        type: DataTypes.TEXT(),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      tagList: {
        type: DataTypes.ARRAY(DataTypes.STRING(20)),
        defaultValue: [],
      },
      favoritesCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    { sequelize, tableName: 'Articles' },
  );
};

export const initArticleAssociations = () => {
  Article.belongsTo(User, {
    foreignKey: {
      name: 'authorId',
      allowNull: false,
    },
    as: 'user',
  });

  Article.hasMany(Comment, {
    foreignKey: {
      name: 'articleId',
      allowNull: false,
    },
    as: 'comments',
    onDelete: 'CASCADE',
  });
};
