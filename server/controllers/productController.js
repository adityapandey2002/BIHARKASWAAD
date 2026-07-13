const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { Product } = require('../models/index');

// Helper: build public URL for an image
const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get('host')}/api/${imagePath.replace(/^\\/, '').replace(/^\\/, '')}`;
};

// Helper: delete old image file from disk
const deleteImageFile = (imagePath) => {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, '..', imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
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
      obj.images = obj.images ? obj.images.map(img => buildImageUrl(req, img)) : [];
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
    obj.images = obj.images ? obj.images.map(img => buildImageUrl(req, img)) : [];

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
    obj.images = obj.images ? obj.images.map(img => buildImageUrl(req, img)) : [];

    console.log('✅ Product created:', product.id);
    res.status(201).json({ status: 'success', data: obj });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.files) req.files.forEach(f => deleteImageFile(f.path));
    console.error('❌ Error creating product:', error);
    res.status(400).json({ status: 'error', message: error.message });
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
    obj.images = obj.images ? obj.images.map(img => buildImageUrl(req, img)) : [];

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
