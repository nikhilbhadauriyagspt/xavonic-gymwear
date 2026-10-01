const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Public endpoints
// GET /api/reviews/product/:productId
router.get('/product/:productId', reviewController.getProductReviews);

// POST /api/reviews/product/:productId
router.post('/product/:productId', reviewController.submitProductReview);

// POST /api/reviews/:reviewId/helpful
router.post('/:reviewId/helpful', reviewController.voteHelpfulReview);

module.exports = router;
