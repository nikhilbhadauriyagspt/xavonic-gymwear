const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');

// Public storefront route to fetch active/scheduled banners
router.get('/', bannerController.getPublicBanners);

module.exports = router;
