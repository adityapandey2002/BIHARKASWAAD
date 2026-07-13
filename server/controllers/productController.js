const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Product } = require('../models/index');

// Helper: build public URL for an image
// Images are served directly from public_html/uploads (symlinked from nodejs/uploads)
// This bypasses ModSecurity which blocks requests going through Node.js proxy
const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  // Normalize path: replace backslashes → forward slashes, strip leading slash
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  // Remove 'uploads/' prefix if already there, then rebuild clean URL
  const relativePath = cleanPath.replace(/^uploads\//, '');
  const host = `${req.protocol}://${req.get('host')}`;
  return `${host}/uploads/${relativePath}`;
};

// Helper: safely map images array
const safeMapImages = (images, req) => {
  if (!images) return [];
  let parsed = images;
  if (typeof images === 'string') {
    try {
      parsed = JSON.parse(images);
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(parsed) ? parsed.map(img => buildImageUrl(req, img)) : [];
};

// Helper: safely parse JSON field (MySQL sometimes returns JSON columns as strings)
const safeParseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val) || (typeof val === 'object' && val !== null)) return val;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch (e) { return fallback; }
  }
  return fallback;
};

// Helper: delete old image file from disk
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error(`❌ Failed to delete image file: ${imagePath}`, err);
  }
};

// ── GET All Products ──────────────────────────────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    const where = { published: true };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const products = await Product.findAll({ where, order: [['createdAt', 'DESC']] });

    const result = products.map((p) => {
      const obj = p.toJSON();
      obj.imageUrl = buildImageUrl(req, obj.imagePath);
      obj.images = safeMapImages(obj.images, req);
      obj.variants = safeParseJSON(obj.variants, []);
      return obj;
    });

    console.log(`✅ Sending ${result.length} products`);
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── GET Single Product ────────────────────────────────────────────────────────
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product || !product.published) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid product ID' });
  }
};

// ── CREATE Product (Admin) ────────────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Please upload at least one product image' });
    }

    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants = JSON.parse(req.body.variants);
      } catch (e) {
        console.error('Invalid variants JSON');
      }
    }

    const imagePaths = req.files.map(f => f.path.replace(/\\/g, '/'));

    const product = await Product.create({
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      category: req.body.category,
      stock: parseInt(req.body.stock),
      featured: req.body.featured === 'true',
      imagePath: imagePaths[0],
      imageContentType: req.files[0].mimetype,
      images: imagePaths,
      variants: parsedVariants
    });

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    console.log('✅ Product created:', product.id);
    res.status(201).json({ status: 'success', data: obj });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) req.files.forEach(f => deleteImageFile(f.path));
    console.error('❌ Error creating product:', error.message, error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE Product (Admin) ────────────────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Update fields
    if (req.body.name) product.name = req.body.name;
    if (req.body.description) product.description = req.body.description;
    if (req.body.price) product.price = parseFloat(req.body.price);
    if (req.body.category) product.category = req.body.category;
    if (req.body.stock !== undefined) product.stock = parseInt(req.body.stock);
    if (req.body.featured !== undefined) product.featured = req.body.featured === 'true';

    if (req.body.variants) {
      try {
        product.variants = JSON.parse(req.body.variants);
      } catch (e) {
        console.error('Invalid variants JSON');
      }
    }

    // Replace image if new one uploaded
    if (req.files && req.files.length > 0) {
      deleteImageFile(product.imagePath);
      if (product.images) product.images.forEach(img => deleteImageFile(img));
      
      const imagePaths = req.files.map(f => f.path.replace(/\\/g, '/'));
      product.imagePath = imagePaths[0];
      product.imageContentType = req.files[0].mimetype;
      product.images = imagePaths;
    }

    await product.save();

    const obj = product.toJSON();
    obj.imageUrl = buildImageUrl(req, obj.imagePath);
    obj.images = safeMapImages(obj.images, req);
    obj.variants = safeParseJSON(obj.variants, []);

    console.log('✅ Product updated:', product.id);
    res.status(200).json({ status: 'success', data: obj });
  } catch (error) {
    if (req.files) req.files.forEach(f => deleteImageFile(f.path));
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── DELETE Product (Admin) ────────────────────────────────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Delete image file from disk
    deleteImageFile(product.imagePath);
    if (product.images) product.images.forEach(img => deleteImageFile(img));

    await product.destroy();

    console.log('🗑️ Product deleted:', req.params.id);
    res.status(200).json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
