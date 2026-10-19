const express = require('express');
const router = express.Router();
const serviceCtrl = require('../controllers/service.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public
router.get('/', serviceCtrl.getServices);

// Admin only
router.post('/', authenticate, authorize('admin'), serviceCtrl.createService);
router.put('/:id', authenticate, authorize('admin'), serviceCtrl.updateService);
router.delete('/:id', authenticate, authorize('admin'), serviceCtrl.deleteService);

module.exports = router;
