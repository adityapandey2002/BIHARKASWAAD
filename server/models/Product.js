const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    category: {
      type: DataTypes.ENUM('Snacks', 'Sweets', 'Spices', 'Beverages', 'Meals', 'Pickles'),
      allowNull: false,
    },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    imagePath: { type: DataTypes.STRING(500), allowNull: true },
    imageContentType: { type: DataTypes.STRING(100), allowNull: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
    ratingsAverage: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    ratingsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'products' }
);

module.exports = Product;
