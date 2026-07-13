const express = require('express');
const { createOrder, verifyPayment, getOrder, getUserOrders } = require('../controllers/paymentControllers');
const { protect } = require('../controllers/authController');

const router = express.Router();

router.use(protect); // All payment routes require authentication

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/orders/:id', getOrder);
router.get('/my-orders', getUserOrders);

module.exports = router;
