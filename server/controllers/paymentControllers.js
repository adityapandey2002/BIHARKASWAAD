const crypto = require('crypto');
const Razorpay = require('razorpay');
const { Order, OrderItem, Cart, CartItem } = require('../models/index');

let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (e) {
  console.warn("⚠️ Razorpay disabled:", e.message);
}

// ── Create Razorpay Order ─────────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { amount, cartItems, shippingAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: 'error', message: 'Invalid amount' });
    }

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { userId: req.user.id.toString(), userEmail: req.user.email },
    };

    if (!razorpay) {
      return res.status(503).json({ status: 'error', message: 'Razorpay is not configured on the server. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to the environment variables.' });
    }

    const razorpayOrder = await razorpay.orders.create(options);

    // Create order record in DB
    const order = await Order.create({
      userId: req.user.id,
      totalAmount: amount,
      shippingName: shippingAddress?.name,
      shippingPhone: shippingAddress?.phone,
      shippingAddress: shippingAddress?.address,
      shippingCity: shippingAddress?.city,
      shippingState: shippingAddress?.state,
      shippingPincode: shippingAddress?.pincode,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
    });

    if (cartItems && cartItems.length > 0) {
      const orderItemsData = cartItems.map(item => ({
        orderId: order.id,
        productId: item.productId || item.product?.id,
        productName: item.product?.name || 'Unknown Product',
        quantity: item.quantity,
        price: item.price,
        variantWeight: item.variantWeight || null
      }));
      await OrderItem.bulkCreate(orderItemsData);
    }

    console.log('✅ Razorpay order created:', razorpayOrder.id);

    res.status(200).json({
      status: 'success',
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        dbOrderId: order.id,
      },
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── Get Razorpay Config ───────────────────────────────────────────────────────
exports.getConfig = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      keyId: process.env.RAZORPAY_KEY_ID
    }
  });
};

// ── Verify Payment ────────────────────────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      const order = await Order.findByPk(dbOrderId);

      if (!order) {
        return res.status(404).json({ status: 'error', message: 'Order not found' });
      }

      order.razorpayPaymentId = razorpay_payment_id;
      order.razorpaySignature = razorpay_signature;
      order.paymentStatus = 'completed';
      order.orderStatus = 'processing';
      await order.save();

      // Deduct stock for each purchased item
      const orderItems = await OrderItem.findAll({ where: { orderId: order.id } });
      for (const item of orderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          // Reduce parent stock
          product.stock = Math.max(0, product.stock - item.quantity);

          // If variant was purchased, reduce variant stock
          if (item.variantWeight && product.variants && product.variants.length > 0) {
            const updatedVariants = product.variants.map(v => {
              if (v.weight === item.variantWeight && v.stock !== undefined) {
                return { ...v, stock: Math.max(0, parseInt(v.stock) - item.quantity) };
              }
              return v;
            });
            product.variants = updatedVariants;
          }
          await product.save();
        }
      }

      // Clear the user's cart now that payment is successful
      const cart = await Cart.findOne({ where: { userId: order.userId } });
      if (cart) {
        await CartItem.destroy({ where: { cartId: cart.id } });
        cart.totalAmount = 0;
        await cart.save();
      }

      console.log('✅ Payment verified:', razorpay_payment_id);
      res.status(200).json({ status: 'success', message: 'Payment verified successfully', data: order });
    } else {
      const order = await Order.findByPk(dbOrderId);
      if (order) {
        order.paymentStatus = 'failed';
        await order.save();
      }
      res.status(400).json({ status: 'error', message: 'Invalid payment signature' });
    }
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── Get Order Details ─────────────────────────────────────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) return res.status(404).json({ status: 'error', message: 'Order not found' });

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Not authorized to view this order' });
    }

    res.status(200).json({ status: 'success', data: order });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// ── Get User Orders ───────────────────────────────────────────────────────────
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ status: 'success', results: orders.length, data: orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};
