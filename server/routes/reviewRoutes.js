const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../controllers/authController');

router.post('/', protect, reviewController.addReview);
router.get('/product/:productId', reviewController.getProductReviews);

module.exports = router;
