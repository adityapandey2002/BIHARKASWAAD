const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Blog = sequelize.define(
  'Blog',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(500), allowNull: false },
    excerpt: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    author: { type: DataTypes.STRING(255), allowNull: false },
    category: {
      type: DataTypes.ENUM(
        'Traditional Recipes',
        'Food Culture',
        'Health & Wellness',
        'Festivals',
        'Sustainability',
        'Heritage'
      ),
      allowNull: false,
    },
    imagePath: { type: DataTypes.STRING(500), allowNull: true },
    imageContentType: { type: DataTypes.STRING(100), allowNull: true },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { tableName: 'blogs' }
);

module.exports = Blog;
