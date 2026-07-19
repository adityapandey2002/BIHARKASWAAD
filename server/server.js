// Load environment variables FIRST
require('dotenv').config();
const fs = require('fs');
// Removed duplicate path require

// Global error catcher to write to file
process.on('uncaughtException', (err) => {
  fs.appendFileSync('startup-error.log', `Uncaught Exception: ${err.message}\n${err.stack}\n\n`);
});
process.on('unhandledRejection', (err) => {
  fs.appendFileSync('startup-error.log', `Unhandled Rejection: ${err.message}\n${err.stack}\n\n`);
});

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const sequelize = require('./config/database');

// Import models to register associations
require('./models/index');

const app = express();

// Trust proxy — required when running behind Hostinger's reverse proxy
app.set('trust proxy', 1);

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'checkout.razorpay.com'],
        frameSrc: ["'self'", 'checkout.razorpay.com', 'api.razorpay.com'],
        connectSrc: ["'self'", 'api.razorpay.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again after 15 minutes.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many login attempts, please try again after 15 minutes.' },
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// ─── Core Middleware ──────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://biharkaswaad.in',
  'https://www.biharkaswaad.in',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// ─── Serve Uploaded Files as Static ──────────────────────────────────────────
// Custom handler to bypass express.static quirks and check both possible paths
app.get('/api/media/*', (req, res) => {
  const fs = require('fs');
  const relativePath = req.params[0]; // e.g., 'products/123.jpg'
  
  const path1 = path.join(process.cwd(), 'uploads', relativePath);
  const path2 = path.join(__dirname, 'uploads', relativePath);
  const path3 = path.join(process.cwd(), 'server', 'uploads', relativePath);
  
  if (fs.existsSync(path1)) {
    return res.sendFile(path1);
  } else if (fs.existsSync(path2)) {
    return res.sendFile(path2);
  } else if (fs.existsSync(path3)) {
    return res.sendFile(path3);
  } else {
    return res.status(404).json({ error: 'Image not found on server', pathsChecked: [path1, path2, path3] });
  }
});

// ─── API Health Check ─────────────────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running!',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL',
  });
});

// ─── Load & Mount Routes ──────────────────────────────────────────────────────
let authRoutes, productRoutes, cartRoutes, orderRoutes, paymentRoutes,
    blogRoutes, wishlistRoutes, siteAssetsRoutes, contactRoutes, categoryRoutes, reviewRoutes;

try { authRoutes = require('./routes/authRoutes'); console.log('✅ Auth routes loaded'); }
catch (err) { console.error('❌ Auth routes:', err.message); }

try { productRoutes = require('./routes/productRoutes'); console.log('✅ Product routes loaded'); }
catch (err) { console.error('❌ Product routes:', err.message); }


try { categoryRoutes = require('./routes/categoryRoutes'); console.log('✅ Category routes loaded'); }
catch (err) { console.error('❌ Category routes:', err.message); }

try { reviewRoutes = require('./routes/reviewRoutes'); console.log('✅ Review routes loaded'); }
catch (err) { console.error('❌ Review routes:', err.message); }

try { cartRoutes = require('./routes/cartRoutes'); console.log('✅ Cart routes loaded'); }
catch (err) { console.error('❌ Cart routes:', err.message); }

try { orderRoutes = require('./routes/orderRoutes'); console.log('✅ Order routes loaded'); }
catch (err) { console.error('❌ Order routes:', err.message); }

try { paymentRoutes = require('./routes/paymentRoutes'); console.log('✅ Payment routes loaded'); }
catch (err) { console.warn('⚠️  Payment routes not found'); }

try { blogRoutes = require('./routes/blogRoutes'); console.log('✅ Blog routes loaded'); }
catch (err) { console.error('❌ Blog routes:', err.message); }

try { wishlistRoutes = require('./routes/wishlistRoutes'); console.log('✅ Wishlist routes loaded'); }
catch (err) { console.error('❌ Wishlist routes:', err.message); }

try { siteAssetsRoutes = require('./routes/siteAssetsRoutes'); console.log('✅ Site assets routes loaded'); }
catch (err) { console.warn('⚠️  Site assets routes not found'); }

try { contactRoutes = require('./routes/contactRoutes'); console.log('✅ Contact routes loaded'); }
catch (err) { console.warn('⚠️  Contact routes not found'); }

if (authRoutes) app.use('/api/auth', authRoutes);

// Emergency route to recreate dropped tables
app.get('/api/sync-db', async (req, res) => {
  try {
    const syncOpts = { alter: true };
    await sequelize.sync(syncOpts);
    res.status(200).send('<h1>SUCCESS!</h1><p>All database tables have been perfectly recreated with the new features.</p><p>You can now close this tab and try your bulk upload again.</p>');
  } catch (err) {
    res.status(500).send(`<h1>ERROR</h1><p>${err.message}</p>`);
  }
});

if (productRoutes) app.use('/api/products', productRoutes);
if (cartRoutes) app.use('/api/cart', cartRoutes);
if (orderRoutes) app.use('/api/orders', orderRoutes);
if (paymentRoutes) app.use('/api/payment', paymentRoutes);
if (blogRoutes) app.use('/api/blogs', blogRoutes);
if (wishlistRoutes) app.use('/api/wishlists', wishlistRoutes);
if (siteAssetsRoutes) app.use('/api/site-assets', siteAssetsRoutes);
if (contactRoutes) app.use('/api/contacts', contactRoutes);
if (categoryRoutes) app.use('/api/categories', categoryRoutes);
if (reviewRoutes) app.use('/api/reviews', reviewRoutes);

// ─── Serve React Frontend (Production) ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, 'public');
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.use((req, res) => {
    res.status(404).json({ status: 'error', message: `Cannot ${req.method} ${req.url}` });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.startsWith('CORS')) {
    return res.status(403).json({ status: 'error', message: err.message });
  }
  console.error('❌ Server error:', err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message,
  });
});

// ─── Start Server with MySQL Sync ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log('✅ MySQL connected successfully');
    // Temporarily forcing alter: true in production so Hostinger creates the tables automatically
    const syncOpts = { alter: true };
    return sequelize.sync(syncOpts);
  })
  .then(() => {
    console.log('✅ All MySQL tables synced');
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server running on port ${PORT} (Without DB Sync)`);
      console.log('='.repeat(50) + '\n');
    });
  })
  .catch((err) => {
    const errorMsg = `❌ MySQL connection failed: ${err.message}\n   Check DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in .env\nStack: ${err.stack}\n\n`;
    console.error(errorMsg);
    fs.appendFileSync('startup-error.log', errorMsg);
    
    // START THE SERVER ANYWAY SO WE DON'T GET A 503 ERROR
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server running on port ${PORT} (BUT DATABASE IS DISCONNECTED!)`);
      console.log('='.repeat(50) + '\n');
    });
  });
