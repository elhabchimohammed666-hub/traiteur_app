const express = require('express');
const router = express.Router();
const dishCtrl = require('../controllers/dish.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// Public
router.get('/', dishCtrl.getDishes);
router.get('/:idOrSlug', dishCtrl.getDishByIdOrSlug);

// Admin only
router.post('/', authenticate, authorize('admin'), dishCtrl.createDish);
router.put('/:id', authenticate, authorize('admin'), dishCtrl.updateDish);
router.patch('/:id', authenticate, authorize('admin'), dishCtrl.updateDish);
router.delete('/:id', authenticate, authorize('admin'), dishCtrl.deleteDish);

module.exports = router;
