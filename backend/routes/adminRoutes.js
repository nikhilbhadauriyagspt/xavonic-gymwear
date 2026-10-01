const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/adminAuthController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  testWhatsAppGateway,
  getSmtpConfig,
  saveSmtpConfig,
  testSmtpEmail,
  getCloudinaryConfig,
  saveCloudinaryConfig,
  getOffersConfig,
  saveOffersConfig,
  getGoogleMapsConfig,
  saveGoogleMapsConfig,
  getShippingConfig,
  saveShippingConfig,
  getBrandContent,
  saveBrandContent,
  uploadBrandLogo,
} = require('../controllers/adminSettingsController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const {
  getCustomers,
  getCustomerDetail,
  deleteCustomer,
} = require('../controllers/adminCustomerController');

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const {
  getProducts,
  getProductByIdOrSlug,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const {
  getAdminReviews,
  updateReviewStatus,
  deleteReview,
} = require('../controllers/reviewController');

const {
  getAdminOrders,
  updateOrderStatus,
  cancelOrder,
  updateReturnAndRefund,
  deleteOrder,
} = require('../controllers/orderController');

const {
  getAdminBanners,
  createBanner,
  updateBanner,
  toggleBannerStatus,
  deleteBanner,
} = require('../controllers/bannerController');

// Public: Admin Login
router.post('/login', loginAdmin);

// Banners Management for Admin
router.get('/banners', verifyAdminToken, getAdminBanners);
router.post('/banners', verifyAdminToken, upload.single('image'), createBanner);
router.put('/banners/:id', verifyAdminToken, upload.single('image'), updateBanner);
router.patch('/banners/:id/status', verifyAdminToken, toggleBannerStatus);
router.delete('/banners/:id', verifyAdminToken, deleteBanner);

// Orders Management for Admin
router.get('/orders', verifyAdminToken, getAdminOrders);
router.patch('/orders/:orderId/status', verifyAdminToken, updateOrderStatus);
router.post('/orders/:orderId/cancel', verifyAdminToken, cancelOrder);
router.patch('/orders/:orderId/return-refund', verifyAdminToken, updateReturnAndRefund);
router.delete('/orders/:orderId', verifyAdminToken, deleteOrder);

// Reviews Moderation for Admin
router.get('/reviews', verifyAdminToken, getAdminReviews);
router.patch('/reviews/:reviewId/status', verifyAdminToken, updateReviewStatus);
router.delete('/reviews/:reviewId', verifyAdminToken, deleteReview);

// Products Management (Public GET for Storefront, Protected POST/PUT/DELETE for Admin)
router.get('/products', getProducts);
router.get('/products/:idOrSlug', getProductByIdOrSlug);
router.post('/products', verifyAdminToken, upload.any(), createProduct);
router.put('/products/:id', verifyAdminToken, upload.any(), updateProduct);
router.delete('/products/:id', verifyAdminToken, deleteProduct);

// Protected: Admin Profile
router.get('/me', verifyAdminToken, getAdminProfile);

// Protected: Customers List & Management
router.get('/customers', verifyAdminToken, getCustomers);
router.get('/customers/:id', verifyAdminToken, getCustomerDetail);
router.delete('/customers/:id', verifyAdminToken, deleteCustomer);

// Categories Management (Public GET for Frontend, Protected POST/PUT/DELETE for Admin)
router.get('/categories', getCategories);
router.post('/categories', verifyAdminToken, upload.single('image'), createCategory);
router.put('/categories/:id', verifyAdminToken, upload.single('image'), updateCategory);
router.delete('/categories/:id', verifyAdminToken, deleteCategory);

// Protected: WhatsApp Gateway Configuration
router.get('/settings/whatsapp', verifyAdminToken, getWhatsAppConfig);
router.post('/settings/whatsapp', verifyAdminToken, saveWhatsAppConfig);
router.post('/settings/whatsapp/test', verifyAdminToken, testWhatsAppGateway);

// Protected: Nodemailer SMTP Configuration
router.get('/settings/smtp', verifyAdminToken, getSmtpConfig);
router.post('/settings/smtp', verifyAdminToken, saveSmtpConfig);
router.post('/settings/smtp/test', verifyAdminToken, testSmtpEmail);

// Protected: Cloudinary Image Storage Configuration
router.get('/settings/cloudinary', verifyAdminToken, getCloudinaryConfig);
router.post('/settings/cloudinary', verifyAdminToken, saveCloudinaryConfig);

// Public/Protected: Global Offers & Discounts Engine
router.get('/settings/offers', getOffersConfig);
router.post('/settings/offers', verifyAdminToken, saveOffersConfig);

// Public/Protected: Google Maps API & Geolocation
router.get('/settings/maps', getGoogleMapsConfig);
router.post('/settings/maps', verifyAdminToken, saveGoogleMapsConfig);

// Public/Protected: Shipping & COD Delivery Rules
router.get('/settings/shipping', getShippingConfig);
router.post('/settings/shipping', verifyAdminToken, saveShippingConfig);

// Public/Protected: Brand Identity, About Story, Social Links & Policy CMS
router.get('/settings/brand-content', getBrandContent);
router.post('/settings/brand-content', verifyAdminToken, saveBrandContent);
router.post('/settings/upload-logo', verifyAdminToken, upload.single('logo'), uploadBrandLogo);

// Protected: Admin Live System Notifications
const {
  getAdminNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/adminNotificationController');

router.get('/notifications', verifyAdminToken, getAdminNotifications);
router.patch('/notifications/:id/read', verifyAdminToken, markAsRead);
router.post('/notifications/mark-all-read', verifyAdminToken, markAllAsRead);
router.delete('/notifications/:id', verifyAdminToken, deleteNotification);

module.exports = router;

