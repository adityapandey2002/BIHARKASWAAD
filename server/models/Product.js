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
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subCategory: { type: DataTypes.STRING(255), allowNull: true },
    sku: { type: DataTypes.STRING(100), allowNull: true },
    packet: { type: DataTypes.STRING(100), allowNull: true },
    mrp: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    discountPercentage: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
    flipkartLink: { type: DataTypes.STRING(500), allowNull: true },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    imagePath: { type: DataTypes.STRING(500), allowNull: true },
    imageContentType: { type: DataTypes.STRING(100), allowNull: true },
    images: { type: DataTypes.JSON, defaultValue: [] },
    variants: { type: DataTypes.JSON, defaultValue: [] },
    shelfLife: { type: DataTypes.STRING(100), allowNull: true },
    dietaryPreference: { type: DataTypes.ENUM('Veg', 'Non-Veg'), defaultValue: 'Veg' },
    tags: { type: DataTypes.STRING(500), allowNull: true },
    featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    published: { type: DataTypes.BOOLEAN, defaultValue: true },
    ratingsAverage: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    ratingsCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'products' }
);

module.exports = Product;
