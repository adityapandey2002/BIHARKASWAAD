const { Cart, CartItem, Product } = require('../models/index');

// Helper: build image URL (must match productController — include /api/)
const buildImageUrl = (req, imagePath) => {
  if (!imagePath) return null;
  return `${req.protocol}://${req.get('host')}/api/${imagePath.replace(/^\\/, '').replace(/^\//, '')}`;
};

// Helper: format cart with image URLs
const formatCart = (cart, req) => {
  const obj = cart.toJSON ? cart.toJSON() : cart;
  if (obj.items) {
    obj.items = obj.items.map((item) => {
      if (item.product) {
        item.product.imageUrl = buildImageUrl(req, item.product.imagePath);
      }
      return item;
    });
  }
  return obj;
};

// ── GET Cart ──────────────────────────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    if (!cart) {
      return res.status(200).json({ status: 'success', data: { items: [], totalAmount: 0 } });
    }

    res.status(200).json({ status: 'success', data: formatCart(cart, req) });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── ADD to Cart ───────────────────────────────────────────────────────────────
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variantWeight = null } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ status: 'error', message: 'Product not found' });

    // Find or create cart
    let [cart] = await Cart.findOrCreate({ where: { userId: req.user.id }, defaults: { totalAmount: 0 } });

    let itemPrice = parseFloat(product.price);
    if (variantWeight && product.variants && product.variants.length > 0) {
      const variant = product.variants.find(v => v.weight === variantWeight);
      if (variant && variant.price) itemPrice = parseFloat(variant.price);
    }

    // Find or create cart item
    const existingItem = await CartItem.findOne({ where: { cartId: cart.id, productId, variantWeight } });

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = itemPrice;
      await existingItem.save();
    } else {
      await CartItem.create({ cartId: cart.id, productId, quantity, price: itemPrice, variantWeight });
    }

    // Recalculate total
    const allItems = await CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalAmount = allItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    await cart.save();

    // Re-fetch with associations
    cart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    res.status(200).json({ status: 'success', data: formatCart(cart, req) });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── UPDATE Item Quantity ──────────────────────────────────────────────────────
exports.updateItemQuantity = async (req, res) => {
  try {
    const { productId, quantity, variantWeight = null } = req.body;
    if (quantity < 1) return res.status(400).json({ status: 'error', message: 'Quantity must be >= 1' });

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ status: 'error', message: 'Cart not found' });

    const item = await CartItem.findOne({ where: { cartId: cart.id, productId, variantWeight } });
    if (!item) return res.status(404).json({ status: 'error', message: 'Item not in cart' });

    item.quantity = quantity;
    await item.save();

    // Recalculate total
    const allItems = await CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalAmount = allItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    await cart.save();

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    res.status(200).json({ status: 'success', data: formatCart(updatedCart, req) });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── REMOVE Item ───────────────────────────────────────────────────────────────
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const variantWeight = req.query.variantWeight || null;

    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ status: 'error', message: 'Cart not found' });

    const deleted = await CartItem.destroy({ where: { cartId: cart.id, productId, variantWeight } });
    if (!deleted) return res.status(404).json({ status: 'error', message: 'Item not in cart' });

    // Recalculate total
    const allItems = await CartItem.findAll({ where: { cartId: cart.id } });
    cart.totalAmount = allItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);
    await cart.save();

    const updatedCart = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    res.status(200).json({ status: 'success', data: formatCart(updatedCart, req) });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── CLEAR Cart ────────────────────────────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { userId: req.user.id } });
    if (!cart) return res.status(404).json({ status: 'error', message: 'Cart not found' });

    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalAmount = 0;
    await cart.save();

    res.status(200).json({ status: 'success', data: { items: [], totalAmount: 0 } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
