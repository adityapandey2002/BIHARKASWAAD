const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define(
  'CartItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2) },
  },
  { tableName: 'cart_items' }
);

module.exports = CartItem;
