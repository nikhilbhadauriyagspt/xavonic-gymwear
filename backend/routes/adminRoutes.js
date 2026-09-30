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
} = require('../controllers/adminSettingsController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const {
  getCustomers,
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

// Public: Admin Login
router.post('/login', loginAdmin);

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

module.exports = router;
