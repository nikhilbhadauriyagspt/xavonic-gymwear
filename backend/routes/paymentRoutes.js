const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Public route to fetch public key_id and payment settings
router.get('/config', paymentController.getPaymentConfig);

// Public route to generate Razorpay Order ID for active cart checkout
router.post('/create-order', paymentController.createPaymentOrder);

// Public route to cryptographically verify payment signature & confirm order
router.post('/verify', paymentController.verifyPaymentAndPlaceOrder);

// Webhook listener for asynchronous S2S notifications
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleRazorpayWebhook);

module.exports = router;
