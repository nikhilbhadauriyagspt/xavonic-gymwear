const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Public endpoints
// POST /api/orders (Place an order)
router.post('/', orderController.createOrder);

// GET /api/orders/track/:orderNumber (Track order)
router.get('/track/:orderNumber', orderController.getOrderDetails);

// GET /api/orders/user/:userIdOrPhone (Customer order history)
router.get('/user/:userIdOrPhone', orderController.getCustomerOrders);

// GET /api/orders/:orderNumber/invoice (Get Order Tax Invoice / Download)
router.get('/:orderNumber/invoice', orderController.getOrderInvoice);

// Public D2C Endpoints
// GET /api/orders/recent-activity (Live FOMO sales toast)
router.get('/recent-activity', orderController.getRecentPublicActivity);

// POST /api/orders/abandoned/capture (Capture in-progress checkout)
router.post('/abandoned/capture', orderController.captureAbandonedCheckout);

// POST /api/orders/stock-notify (Out-of-stock WhatsApp alert request)
router.post('/stock-notify', orderController.submitStockNotification);

// POST /api/orders/:orderId/cancel (Cancel order)
router.post('/:orderId/cancel', orderController.cancelOrder);

// POST /api/orders/:orderId/return (Request return)
router.post('/:orderId/return', orderController.requestReturn);

module.exports = router;
