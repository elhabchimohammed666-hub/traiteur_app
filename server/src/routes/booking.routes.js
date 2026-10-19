const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const { publicBookingLimiter } = require('../middlewares/rateLimit');

// Public endpoints
router.post('/estimate', bookingCtrl.estimateBooking);
router.post('/public', publicBookingLimiter, bookingCtrl.createPublicBooking);
router.post('/public/:code/whatsapp-click', bookingCtrl.recordWhatsAppClick);
router.get('/track', bookingCtrl.trackBooking);
router.patch('/track/:code/respond', bookingCtrl.respondToBooking);
router.post('/contact', bookingCtrl.submitContactMessage);
router.get('/pdf/:id', bookingCtrl.downloadBookingPDF); // Accessible for download

// Authenticated staff & admin endpoints
router.get('/', authenticate, authorize('admin', 'staff'), bookingCtrl.getAdminBookings);
router.post('/', authenticate, authorize('admin', 'staff'), bookingCtrl.createAdminBooking);
router.get('/export', authenticate, authorize('admin'), bookingCtrl.exportBookingsCSV);
router.get('/:id', authenticate, authorize('admin', 'staff'), bookingCtrl.getAdminBookingById);
router.put('/:id', authenticate, authorize('admin', 'staff'), bookingCtrl.updateAdminBooking);
router.patch('/:id/status', authenticate, authorize('admin', 'staff'), bookingCtrl.updateBookingStatus);
router.post('/:id/notes', authenticate, authorize('admin', 'staff'), bookingCtrl.addInternalNote);
router.get('/:id/pdf', authenticate, authorize('admin', 'staff'), bookingCtrl.downloadBookingPDF);
router.post('/:id/send-quote', authenticate, authorize('admin', 'staff'), bookingCtrl.sendQuoteEmail);
router.get('/:id/whatsapp-link', authenticate, authorize('admin', 'staff'), bookingCtrl.getWhatsAppReplyLink);

// Admin-only financial and destruction actions
router.post('/:id/payments', authenticate, authorize('admin'), bookingCtrl.addPayment);
router.delete('/:id/payments/:paymentId', authenticate, authorize('admin'), bookingCtrl.removePayment);
router.delete('/:id', authenticate, authorize('admin'), bookingCtrl.deleteBooking);

module.exports = router;
