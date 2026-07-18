const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteAssets = sequelize.define('SiteAssets', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  logoPath: { type: DataTypes.STRING(500), allowNull: true },
  logoContentType: { type: DataTypes.STRING(100), allowNull: true },
  siteName: { type: DataTypes.STRING(255), defaultValue: 'Bihar Ka Swaad' },
  tagline: { type: DataTypes.STRING(500), defaultValue: 'Authentic Flavors from Bihar' },
  heroImage: { type: DataTypes.STRING(1000), allowNull: true },
  heroVideo1: { type: DataTypes.STRING(1000), allowNull: true },
  heroVideo2: { type: DataTypes.STRING(1000), allowNull: true }
}, { tableName: 'site_assets' });

module.exports = SiteAssets;
