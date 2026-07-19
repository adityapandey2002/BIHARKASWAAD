const express = require('express');
const { protect, restrictTo } = require('../controllers/authController');
const { createOrder, getMyOrders, getMyFailedOrders, getOrderById, updateOrderStatus, trackOrder } = require('../controllers/orderController');

const router = express.Router();

// Public tracking route
router.get('/track/:id', trackOrder);

// Protected routes below
router.use(protect);

router.post('/', createOrder);
router.get('/mine', getMyOrders);
router.get('/mine/failed', getMyFailedOrders);
router.get('/:id', getOrderById);

// Admin: update status/pay/deliver
router.patch('/:id/status', restrictTo('admin'), updateOrderStatus);

module.exports = router;
