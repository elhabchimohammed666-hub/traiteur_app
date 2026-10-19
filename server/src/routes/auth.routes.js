const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth');
const { loginLimiter } = require('../middlewares/rateLimit');

router.post('/login', loginLimiter, authCtrl.login);
router.post('/refresh', authCtrl.refresh);
router.post('/logout', authenticate, authCtrl.logout);
router.get('/me', authenticate, authCtrl.getMe);
router.put('/change-password', authenticate, authCtrl.changePassword);
router.post('/forgot-password', authCtrl.forgotPassword);
router.post('/reset-password/:token', authCtrl.resetPassword);

module.exports = router;
