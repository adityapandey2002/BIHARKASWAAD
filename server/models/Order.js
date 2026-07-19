const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.DECIMAL(10, 2) },
    shippingName: { type: DataTypes.STRING(255) },
    shippingPhone: { type: DataTypes.STRING(20) },
    shippingAddress: { type: DataTypes.TEXT },
    shippingCity: { type: DataTypes.STRING(100) },
    shippingState: { type: DataTypes.STRING(100) },
    shippingPincode: { type: DataTypes.STRING(10) },
    razorpayOrderId: { type: DataTypes.STRING(255) },
    razorpayPaymentId: { type: DataTypes.STRING(255) },
    razorpaySignature: { type: DataTypes.TEXT },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
    },
    orderStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'),
      defaultValue: 'pending',
    },
    deliveredAt: { type: DataTypes.DATE, allowNull: true },
    trackingKey: { type: DataTypes.STRING(100), allowNull: true },
    courierName: { type: DataTypes.STRING(100), allowNull: true },
  },
  { tableName: 'orders' }
);

module.exports = Order;
