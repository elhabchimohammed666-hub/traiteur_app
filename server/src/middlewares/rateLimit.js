const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // 10 attempts
  message: {
    success: false,
    message: 'Trop de tentatives de connexion échouées. Veuillez réessayer dans 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const publicBookingLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 30, // 30 requests
  message: {
    success: false,
    message: 'Trop de demandes envoyées. Veuillez patienter avant de renouveler votre requête.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { loginLimiter, publicBookingLimiter };
