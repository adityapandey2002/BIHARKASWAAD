const { Order, OrderItem, Cart, CartItem, Product } = require('../models/index');

// ── CREATE Order ──────────────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'card' } = req.body;

    // Get user's cart with items
    const cart = await Cart.findOne({
      where: { userId: req.user.id },
      include: [{ model: CartItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ status: 'error', message: 'Cart is empty' });
    }

    const totalAmount = cart.items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

    // Create the order
    const order = await Order.create({
      userId: req.user.id,
      totalAmount,
      shippingName: shippingAddress?.name,
      shippingPhone: shippingAddress?.phone,
      shippingAddress: shippingAddress?.address,
      shippingCity: shippingAddress?.city,
      shippingState: shippingAddress?.state,
      shippingPincode: shippingAddress?.pincode,
      orderStatus: 'pending',
    });

    // Create order items (snapshot product details at purchase time)
    const orderItemsData = cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.product?.name || 'Unknown Product',
      quantity: item.quantity,
      price: item.price,
    }));
    await OrderItem.bulkCreate(orderItemsData);

    // Clear cart
    await CartItem.destroy({ where: { cartId: cart.id } });
    cart.totalAmount = 0;
    await cart.save();

    res.status(201).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── GET My Orders ─────────────────────────────────────────────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: 'success', data: orders });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// ── GET Order by ID ───────────────────────────────────────────────────────────
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
    });

    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Invalid order id' });
  }
};

// ── UPDATE Order Status (Admin) ───────────────────────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, deliveredAt, paymentStatus } = req.body;

    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    if (status) order.orderStatus = status;
    if (deliveredAt) order.deliveredAt = deliveredAt;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};
