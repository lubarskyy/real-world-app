import { Sequelize, Model, DataTypes, Association, BelongsToGetAssociationMixin } from 'sequelize';
import { User, UserAttributes } from '../users';

export type ArticleAttributes = {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList?: string[];
  favoritesCount?: number;
};
export type ArticleCreationAttributes = Omit<ArticleAttributes, 'id' | 'favoritesCount'> & ArticleAssociations;

type ArticleAssociations = {
  author: UserAttributes['id'];
};
export type ArticlePayload = Omit<ArticleAttributes, 'id'> & {
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
  public author!: ArticleAssociations['author'];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {
    user: Association<Article, User>;
  };

  public getUser!: BelongsToGetAssociationMixin<User>;

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
      name: 'author',
      allowNull: false,
    },
    as: 'user',
  });
};
