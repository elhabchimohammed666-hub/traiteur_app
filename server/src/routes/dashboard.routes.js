const express = require('express');
const router = express.Router();
const dashCtrl = require('../controllers/dashboard.controller');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/upcoming', authenticate, authorize('admin', 'staff'), dashCtrl.getUpcomingEvents);
router.get('/stock-alerts', authenticate, authorize('admin', 'staff'), dashCtrl.getStockAlerts);

// Financial KPIs reserved for admin
router.get('/stats', authenticate, authorize('admin'), dashCtrl.getDashboardStats);
router.get('/revenue', authenticate, authorize('admin'), dashCtrl.getRevenueMonthly);
router.get('/top-items', authenticate, authorize('admin'), dashCtrl.getTopItems);

module.exports = router;
