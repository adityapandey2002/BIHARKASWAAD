const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ContactNote = sequelize.define('ContactNote', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  contactId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT },
  addedBy: { type: DataTypes.INTEGER },
  addedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'contact_notes', timestamps: false });

module.exports = ContactNote;
