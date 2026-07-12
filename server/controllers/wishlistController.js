const { Wishlist, Product } = require('../models/index');

const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get('host')}/${imagePath}`;
};

const formatWishlistItems = (items, req) =>
  items.map((item) => {
    const obj = item.toJSON ? item.toJSON() : item;
    if (obj.product) obj.product.imageUrl = buildImageUrl(req, obj.product.imagePath);
    return obj;
  });

// ── GET Wishlist ──────────────────────────────────────────────────────────────
exports.getWishlist = async (req, res) => {
  try {
    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
      order: [['addedAt', 'DESC']],
    });

    console.log(`✅ Wishlist sent with ${items.length} items`);
    res.status(200).json({ status: 'success', data: { products: formatWishlistItems(items, req) } });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── ADD to Wishlist ───────────────────────────────────────────────────────────
exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ status: 'error', message: 'Product ID is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });

    const existing = await Wishlist.findOne({ where: { userId: req.user.id, productId } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Product already in wishlist' });
    }

    await Wishlist.create({ userId: req.user.id, productId });

    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
    });

    console.log('✅ Product added to wishlist');
    res.status(200).json({
      status: 'success',
      message: 'Product added to wishlist',
      data: { products: formatWishlistItems(items, req) },
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── REMOVE from Wishlist ──────────────────────────────────────────────────────
exports.removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await Wishlist.destroy({ where: { userId: req.user.id, productId } });

    if (!deleted) {
      return res.status(404).json({ status: 'error', message: 'Product not in wishlist' });
    }

    const items = await Wishlist.findAll({
      where: { userId: req.user.id },
      include: [{ model: Product, as: 'product' }],
    });

    console.log('✅ Product removed from wishlist');
    res.status(200).json({
      status: 'success',
      message: 'Product removed from wishlist',
      data: { products: formatWishlistItems(items, req) },
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── CLEAR Wishlist ────────────────────────────────────────────────────────────
exports.clearWishlist = async (req, res) => {
  try {
    await Wishlist.destroy({ where: { userId: req.user.id } });

    console.log('✅ Wishlist cleared');
    res.status(200).json({ status: 'success', message: 'Wishlist cleared', data: { products: [] } });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── CHECK if in Wishlist ──────────────────────────────────────────────────────
exports.checkWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;

    const item = await Wishlist.findOne({ where: { userId: req.user.id, productId } });

    res.status(200).json({ status: 'success', inWishlist: !!item });
  } catch (error) {
    console.error('❌ Error checking wishlist:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};