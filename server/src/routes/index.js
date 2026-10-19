const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const dishRoutes = require('./dish.routes');
const packageRoutes = require('./package.routes');
const serviceRoutes = require('./service.routes');
const equipmentRoutes = require('./equipment.routes');
const availabilityRoutes = require('./availability.routes');
const bookingRoutes = require('./booking.routes');
const dashboardRoutes = require('./dashboard.routes');
const galleryRoutes = require('./gallery.routes');
const testimonialRoutes = require('./testimonial.routes');
const settingRoutes = require('./setting.routes');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Elhabchi Traiteur API v1'
  });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dishes', dishRoutes);
router.use('/packages', packageRoutes);
router.use('/services', serviceRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/availability', availabilityRoutes);
router.use('/bookings', bookingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/gallery', galleryRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/settings', settingRoutes);

module.exports = router;
