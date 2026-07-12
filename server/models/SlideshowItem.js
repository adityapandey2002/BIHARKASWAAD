const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SlideshowItem = sequelize.define('SlideshowItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(500) },
  subtitle: { type: DataTypes.STRING(500), defaultValue: '' },
  buttonText: { type: DataTypes.STRING(100), defaultValue: 'Shop Now' },
  buttonLink: { type: DataTypes.STRING(500), defaultValue: '/products' },
  imagePath: { type: DataTypes.STRING(500) },
  imageContentType: { type: DataTypes.STRING(100) },
  orderNum: { type: DataTypes.INTEGER, defaultValue: 0 },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
  uploadedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'slideshow_items', timestamps: false });

module.exports = SlideshowItem;
