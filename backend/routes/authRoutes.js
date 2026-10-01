const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  sendEmailOtpHandler,
  verifyEmailOtpHandler,
  loginWithEmailPassword,
  registerWithEmailPassword,
  linkEmailSendOtp,
  verifyLinkEmail,
  linkPhoneSendOtp,
  verifyLinkPhone,
  updateProfile,
  getMe,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
  createStockNotification,
} = require('../controllers/authController');

// Customer WhatsApp Auth Endpoints
router.post('/send-whatsapp-otp', sendOtp);
router.post('/verify-whatsapp-otp', verifyOtp);

// Customer Email Auth Endpoints
router.post('/send-email-otp', sendEmailOtpHandler);
router.post('/verify-email-otp', verifyEmailOtpHandler);
router.post('/login-email-password', loginWithEmailPassword);
router.post('/register-email-password', registerWithEmailPassword);

// Profile Linking & Verification Endpoints
router.post('/link-email/send-otp', linkEmailSendOtp);
router.post('/link-email/verify', verifyLinkEmail);
router.post('/link-phone/send-otp', linkPhoneSendOtp);
router.post('/link-phone/verify', verifyLinkPhone);
router.put('/profile', updateProfile);

// Address Book Endpoints (Home / Office / Other)
router.post('/addresses', saveAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.patch('/addresses/:addressId/default', setDefaultAddress);

// Out-of-Stock "Notify Me" Alert Registration
router.post('/stock-notifications', createStockNotification);

// Get Profile
router.get('/me', getMe);

module.exports = router;
