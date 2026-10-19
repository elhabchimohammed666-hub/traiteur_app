const express = require('express');
const router = express.Router();
const eqCtrl = require('../controllers/equipment.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public endpoints
router.get('/', eqCtrl.getEquipment);
router.get('/availability', eqCtrl.getEquipmentAvailabilityController);

// Authenticated staff & admin endpoints
router.get('/alerts', authenticate, authorize('admin', 'staff'), eqCtrl.getEquipmentAlerts);
router.get('/:id', authenticate, authorize('admin', 'staff'), eqCtrl.getEquipmentById);
router.post('/', authenticate, authorize('admin', 'staff'), eqCtrl.createEquipment);
router.put('/:id', authenticate, authorize('admin', 'staff'), eqCtrl.updateEquipment);
router.patch('/:id/stock', authenticate, authorize('admin', 'staff'), eqCtrl.adjustStock);
router.get('/:id/calendar', authenticate, authorize('admin', 'staff'), eqCtrl.getEquipmentCalendar);
router.get('/:id/movements', authenticate, authorize('admin', 'staff'), eqCtrl.getEquipmentMovements);

// Admin only
router.delete('/:id', authenticate, authorize('admin'), eqCtrl.deleteEquipment);

module.exports = router;
