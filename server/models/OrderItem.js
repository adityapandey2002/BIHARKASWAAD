const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: true },
    productName: { type: DataTypes.STRING(255) }, // snapshot of name at order time
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    variantWeight: { type: DataTypes.STRING(100), allowNull: true },
  },
  { tableName: 'order_items', updatedAt: false }
);

module.exports = OrderItem;
