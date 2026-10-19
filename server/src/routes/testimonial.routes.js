const express = require('express');
const router = express.Router();
const testCtrl = require('../controllers/testimonial.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public
router.get('/', testCtrl.getTestimonials);
router.post('/', testCtrl.submitTestimonial);

// Admin only moderation
router.patch('/:id/approve', authenticate, authorize('admin'), testCtrl.toggleApproveTestimonial);
router.delete('/:id', authenticate, authorize('admin'), testCtrl.deleteTestimonial);

module.exports = router;
