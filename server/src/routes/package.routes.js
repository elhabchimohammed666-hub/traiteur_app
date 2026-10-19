const express = require('express');
const router = express.Router();
const packageCtrl = require('../controllers/package.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public
router.get('/', packageCtrl.getPackages);
router.get('/:idOrSlug', packageCtrl.getPackageByIdOrSlug);

// Admin only
router.post('/', authenticate, authorize('admin'), packageCtrl.createPackage);
router.put('/:id', authenticate, authorize('admin'), packageCtrl.updatePackage);
router.delete('/:id', authenticate, authorize('admin'), packageCtrl.deletePackage);

module.exports = router;
