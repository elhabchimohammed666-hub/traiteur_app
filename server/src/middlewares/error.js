const ApiError = require('../utils/ApiError');

function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Une erreur interne est survenue sur le serveur.';
  let errors = err.errors || [];

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Erreur de validation des données.';
    errors = Object.keys(err.errors).map((field) => ({
      field,
      msg: err.errors[field].message
    }));
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'champ';
    message = `Cette valeur existe déjà pour le champ : ${field}.`;
    errors = [{ field, msg: message }];
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Jeton d’authentification invalide.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Données de formulaire non conformes.';
    errors = err.issues.map((i) => ({
      field: i.path.join('.'),
      msg: i.message
    }));
  }

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('[Error Details]', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 && { errors })
  });
}

module.exports = errorHandler;
