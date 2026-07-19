const { Review, User } = require('../models/index');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.addReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body;
    const userId = req.user.id;

    // Verify the order belongs to the user and is delivered
    const order = await Order.findOne({ where: { id: orderId, userId } });
    if (!order) {
      return res.status(403).json({ status: 'error', message: 'Order not found or unauthorized' });
    }
    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ status: 'error', message: 'You can only review delivered products' });
    }

    // Check if user already reviewed this product from this order
    const existingReview = await Review.findOne({ where: { userId, productId, orderId } });
    if (existingReview) {
      return res.status(400).json({ status: 'error', message: 'You have already reviewed this product for this order' });
    }

    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment,
      isVerified: true
    });

    // Update product average rating
    const product = await Product.findByPk(productId);
    if (product) {
      const allReviews = await Review.findAll({ where: { productId } });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      product.ratingsAverage = avg.toFixed(2);
      product.ratingsCount = allReviews.length;
      await product.save();
    }

    res.status(201).json({ status: 'success', data: review });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ status: 'success', data: reviews });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
