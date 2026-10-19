const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { sendEmail } = require('../services/notification.service');

function signAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES }
  );
}

function setRefreshTokenCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, 'Veuillez renseigner votre email et mot de passe.');
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+password +failedLoginAttempts +lockUntil +refreshTokenHash');

  if (!user) {
    throw new ApiError(401, 'Identifiants incorrects.');
  }

  if (user.isLocked()) {
    const remainingMin = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
    throw new ApiError(403, `Compte temporairement verrouillé pour sécurité. Réessayez dans ${remainingMin} minute(s).`);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
    if (user.failedLoginAttempts >= 5) {
      user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lock
    }
    await user.save();
    throw new ApiError(401, 'Identifiants incorrects.');
  }

  // Reset lock counters on success
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  // Hash refresh token in db
  user.refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  await user.save();

  setRefreshTokenCookie(res, refreshToken);

  res.status(200).json({
    success: true,
    message: 'Connexion réussie.',
    data: {
      accessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    }
  });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    throw new ApiError(401, 'Jeton de rafraîchissement absent.');
  }

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Jeton de rafraîchissement invalide ou expiré.');
  }

  const user = await User.findById(decoded.id).select('+refreshTokenHash +role');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Utilisateur introuvable ou inactif.');
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  if (user.refreshTokenHash !== tokenHash) {
    throw new ApiError(401, 'Session révoquée. Veuillez vous reconnecter.');
  }

  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user);

  user.refreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  await user.save();

  setRefreshTokenCookie(res, newRefreshToken);

  res.status(200).json({
    success: true,
    data: {
      accessToken: newAccessToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshTokenHash = undefined;
    await req.user.save();
  }
  res.clearCookie('refreshToken');
  res.status(200).json({
    success: true,
    message: 'Déconnexion effectuée avec succès.'
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    data: user
  });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Veuillez fournir le mot de passe actuel et le nouveau mot de passe.');
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, 'Le nouveau mot de passe doit comporter au moins 8 caractères.');
  }

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Le mot de passe actuel est incorrect.');
  }

  user.password = newPassword;
  user.passwordChangedAt = new Date();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Votre mot de passe a été modifié avec succès.'
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, 'Veuillez saisir votre adresse email.');

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // For security, don't reveal if user exists
    return res.status(200).json({
      success: true,
      message: 'Si cette adresse existe, un email de réinitialisation vous a été envoyé.'
    });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe - Elhabchi Traiteur',
    text: `Bonjour ${user.fullName},\n\nVous avez demandé la réinitialisation de votre mot de passe.\nCliquez ici : ${resetUrl}\nCe lien expire dans 1 heure.`
  });

  res.status(200).json({
    success: true,
    message: 'Un lien de réinitialisation a été envoyé à votre adresse email.'
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 8) {
    throw new ApiError(400, 'Le mot de passe doit contenir au moins 8 caractères.');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new ApiError(400, 'Le lien de réinitialisation est invalide ou a expiré.');
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Votre mot de passe a été réinitialisé. Vous pouvez désormais vous connecter.'
  });
});

module.exports = {
  login,
  refresh,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword
};
