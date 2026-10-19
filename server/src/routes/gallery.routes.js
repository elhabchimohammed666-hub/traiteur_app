const express = require('express');
const router = express.Router();
const galleryCtrl = require('../controllers/gallery.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public
router.get('/', galleryCtrl.getGallery);

// Admin only
router.post('/', authenticate, authorize('admin'), galleryCtrl.createGalleryItem);
router.put('/:id', authenticate, authorize('admin'), galleryCtrl.updateGalleryItem);
router.delete('/:id', authenticate, authorize('admin'), galleryCtrl.deleteGalleryItem);

module.exports = router;
