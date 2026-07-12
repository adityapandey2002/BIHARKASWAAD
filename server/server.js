// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
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
  max: 100,
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
app.use(mongoSanitize());

// ─── Serve Uploaded Files as Static ──────────────────────────────────────────
// This makes images accessible at: /uploads/products/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    blogRoutes, wishlistRoutes, siteAssetsRoutes, contactRoutes;

try { authRoutes = require('./routes/authRoutes'); console.log('✅ Auth routes loaded'); }
catch (err) { console.error('❌ Auth routes:', err.message); }

try { productRoutes = require('./routes/productRoutes'); console.log('✅ Product routes loaded'); }
catch (err) { console.error('❌ Product routes:', err.message); }

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
if (productRoutes) app.use('/api/products', productRoutes);
if (cartRoutes) app.use('/api/cart', cartRoutes);
if (orderRoutes) app.use('/api/orders', orderRoutes);
if (paymentRoutes) app.use('/api/payment', paymentRoutes);
if (blogRoutes) app.use('/api/blogs', blogRoutes);
if (wishlistRoutes) app.use('/api/wishlists', wishlistRoutes);
if (siteAssetsRoutes) app.use('/api/site-assets', siteAssetsRoutes);
if (contactRoutes) app.use('/api/contacts', contactRoutes);

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
    // sync({ alter: true }) updates existing tables to match models without dropping data
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ All MySQL tables synced');
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Database: MySQL (${process.env.DB_NAME})`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log('='.repeat(50) + '\n');
    });
  })
  .catch((err) => {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check DB_HOST, DB_NAME, DB_USER, DB_PASSWORD in .env');
    process.exit(1);
  });
