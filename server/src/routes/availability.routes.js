const express = require('express');
const router = express.Router();
const availCtrl = require('../controllers/availability.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public endpoints
router.get('/calendar', availCtrl.getMonthlyCalendar);
router.get('/date', availCtrl.getDateAvailability);

// Authenticated staff/admin endpoints
router.get('/blocked-dates', authenticate, authorize('admin', 'staff'), availCtrl.getBlockedDates);

// Admin only endpoints
router.post('/blocked-dates', authenticate, authorize('admin'), availCtrl.blockDate);
router.delete('/blocked-dates/:id', authenticate, authorize('admin'), availCtrl.unblockDate);

module.exports = router;
