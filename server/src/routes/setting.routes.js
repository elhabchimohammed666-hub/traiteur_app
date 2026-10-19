const express = require('express');
const router = express.Router();
const settingCtrl = require('../controllers/setting.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public settings (WhatsApp phone, delivery zones, business info)
router.get('/public', settingCtrl.getPublicSettings);

// Admin only settings
router.get('/', authenticate, authorize('admin'), settingCtrl.getSettings);
router.put('/', authenticate, authorize('admin'), settingCtrl.updateSettings);

module.exports = router;
