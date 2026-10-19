const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');

// All user management routes require admin role
router.use(authenticate, authorize('admin'));

router.get('/', userCtrl.getUsers);
router.post('/', userCtrl.createUser);
router.get('/:id', userCtrl.getUserById);
router.put('/:id', userCtrl.updateUser);
router.patch('/:id/status', userCtrl.toggleUserStatus);
router.delete('/:id', userCtrl.deleteUser);

module.exports = router;
