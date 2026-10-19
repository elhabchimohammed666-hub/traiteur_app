const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getUsers = asyncHandler(async (req, res) => {
  const { role, isActive, q } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (q) {
    filter.$or = [
      { fullName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: users
  });
});

const createUser = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, phone } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, 'Nom complet, email et mot de passe sont obligatoires.');
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    throw new ApiError(409, 'Un utilisateur avec cette adresse email existe déjà.');
  }

  const user = await User.create({
    fullName,
    email: email.toLowerCase().trim(),
    password,
    role: role || 'staff',
    phone
  });

  res.status(201).json({
    success: true,
    message: 'Utilisateur créé avec succès.',
    data: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive
    }
  });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable.');
  res.status(200).json({ success: true, data: user });
});

const updateUser = asyncHandler(async (req, res) => {
  const { fullName, phone, role, isActive } = req.body;
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable.');

  if (fullName) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (role && ['admin', 'staff'].includes(role)) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;

  if (req.body.password && req.body.password.length >= 8) {
    user.password = req.body.password;
  }

  await user.save();
  res.status(200).json({
    success: true,
    message: 'Utilisateur mis à jour avec succès.',
    data: user
  });
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable.');

  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'Impossible de désactiver votre propre compte.');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Utilisateur ${user.isActive ? 'activé' : 'désactivé'} avec succès.`,
    data: { id: user._id, isActive: user.isActive }
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    throw new ApiError(400, 'Impossible de supprimer votre propre compte administrateur.');
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'Utilisateur introuvable.');

  res.status(200).json({
    success: true,
    message: 'Utilisateur supprimé avec succès.'
  });
});

module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  toggleUserStatus,
  deleteUser
};
