require('dotenv').config();
const sequelize = require('./config/database');
const { SiteAssets } = require('./models');

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced!');
  process.exit(0);
}).catch(console.error);
