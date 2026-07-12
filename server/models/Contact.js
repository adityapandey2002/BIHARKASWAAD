const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Contact = sequelize.define(
  'Contact',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(255) },
    email: { type: DataTypes.STRING(255) },
    phone: { type: DataTypes.STRING(20) },
    subject: { type: DataTypes.STRING(500) },
    message: { type: DataTypes.TEXT },
    status: {
      type: DataTypes.ENUM('new', 'in-progress', 'resolved', 'closed'),
      defaultValue: 'new',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
    },
    assignedTo: { type: DataTypes.INTEGER, allowNull: true },
    resolvedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { tableName: 'contacts' }
);

module.exports = Contact;
