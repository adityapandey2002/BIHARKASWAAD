const User = require('./User');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Wishlist = require('./Wishlist');
const Blog = require('./Blog');
const Contact = require('./Contact');
const ContactNote = require('./ContactNote');
const SiteAssets = require('./SiteAssets');
const SlideshowItem = require('./SlideshowItem');
const Category = require('./Category');
const Review = require('./Review');

// Associations
User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(Review, { foreignKey: 'orderId' });
Review.belongsTo(Order, { foreignKey: 'orderId' });

// Cart associations
User.hasOne(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId' });

// Order associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId' });

// Wishlist associations
User.hasMany(Wishlist, { foreignKey: 'userId' });
Wishlist.belongsTo(User, { foreignKey: 'userId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });

// Contact associations
Contact.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
Contact.hasMany(ContactNote, { foreignKey: 'contactId', as: 'notes' });
ContactNote.belongsTo(Contact, { foreignKey: 'contactId' });
ContactNote.belongsTo(User, { foreignKey: 'addedBy', as: 'addedByUser' });

module.exports = {
  User,
  Product,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Wishlist,
  Blog,
  Contact,
  ContactNote,
  SiteAssets,
  SlideshowItem,
  Category,
  Review
};
