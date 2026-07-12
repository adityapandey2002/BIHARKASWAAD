const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ── Ensure upload directories exist ──────────────────────────────────────────
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir('uploads/products');
ensureDir('uploads/blogs');
ensureDir('uploads/site');

// ── Disk Storage (industry standard — files on server) ────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Route-based folder selection
    let folder = 'uploads/misc';
    if (req.baseUrl.includes('products')) folder = 'uploads/products';
    else if (req.baseUrl.includes('blogs')) folder = 'uploads/blogs';
    else if (req.baseUrl.includes('site-assets')) folder = 'uploads/site';

    ensureDir(folder);
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// ── File Filter — only images ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WebP images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

module.exports = upload;
