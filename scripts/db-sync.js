require('dotenv').config();
const sequelize = require('../server/config/database');
const { SiteAssets } = require('../server/models');

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced!');
  process.exit(0);
}).catch(console.error);
