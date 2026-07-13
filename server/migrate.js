/**
 * migrate.js — Safe DB migration for Bihar Ka Swaad
 * 
 * Run this ONCE on your Hostinger server to add missing columns
 * that Sequelize alter:true may fail to add due to MySQL restrictions.
 * 
 * Usage:  node migrate.js
 */

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function runMigration() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to MySQL');

    const qi = sequelize.getQueryInterface();

    // ── products table ──────────────────────────────────────────────
    const productCols = await qi.describeTable('products');

    if (!productCols.images) {
      await qi.addColumn('products', 'images', {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: true,
      });
      console.log('✅ Added: products.images');
    } else {
      console.log('ℹ️  Already exists: products.images');
    }

    if (!productCols.variants) {
      await qi.addColumn('products', 'variants', {
        type: DataTypes.JSON,
        defaultValue: [],
        allowNull: true,
      });
      console.log('✅ Added: products.variants');
    } else {
      console.log('ℹ️  Already exists: products.variants');
    }

    // Also expand the category ENUM safely
    // (ALTER TABLE ... MODIFY is needed for ENUM changes in MySQL)
    try {
      await sequelize.query(`
        ALTER TABLE products 
        MODIFY COLUMN category ENUM(
          'Snacks','Sweets','Spices','Beverages','Meals','Pickles',
          'Thekua','Sattu','Tilkut','Achaar','Honey','Bhuja Mix',
          'Gift Hampers','Murabba','Chura','Khaja','Balushahi','Laai'
        ) NOT NULL;
      `);
      console.log('✅ Updated: products.category ENUM values');
    } catch (e) {
      console.warn('⚠️  Could not update category ENUM (might already be correct):', e.message);
    }

    // ── cart_items table ────────────────────────────────────────────
    const cartCols = await qi.describeTable('cart_items');

    if (!cartCols.variantWeight) {
      await qi.addColumn('cart_items', 'variantWeight', {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Added: cart_items.variantWeight');
    } else {
      console.log('ℹ️  Already exists: cart_items.variantWeight');
    }

    if (!cartCols.price) {
      await qi.addColumn('cart_items', 'price', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      });
      console.log('✅ Added: cart_items.price');
    } else {
      console.log('ℹ️  Already exists: cart_items.price');
    }

    // ── order_items table ───────────────────────────────────────────
    const orderItemCols = await qi.describeTable('order_items');

    if (!orderItemCols.variantWeight) {
      await qi.addColumn('order_items', 'variantWeight', {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: null,
      });
      console.log('✅ Added: order_items.variantWeight');
    } else {
      console.log('ℹ️  Already exists: order_items.variantWeight');
    }

    if (!orderItemCols.productName) {
      await qi.addColumn('order_items', 'productName', {
        type: DataTypes.STRING(255),
        allowNull: true,
      });
      console.log('✅ Added: order_items.productName');
    } else {
      console.log('ℹ️  Already exists: order_items.productName');
    }

    console.log('\n🎉 Migration complete! All tables are up to date.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error(err);
    process.exit(1);
  }
}

runMigration();
