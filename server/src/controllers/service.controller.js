const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getServices = asyncHandler(async (req, res) => {
  const { category, activeOnly = 'true' } = req.query;
  const filter = {};
  if (activeOnly === 'true') filter.isActive = true;
  if (category) filter.category = category;

  const services = await Service.find(filter).sort({ displayOrder: 1, createdAt: 1 });
  res.status(200).json({
    success: true,
    data: services
  });
});

const createService = asyncHandler(async (req, res) => {
  const { name, category, price, pricingMode } = req.body;
  if (!name || !name.fr || !category || price === undefined) {
    throw new ApiError(400, 'Nom en français, catégorie et prix sont obligatoires.');
  }

  const service = await Service.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Prestation créée avec succès.',
    data: service
  });
});

const updateService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) throw new ApiError(404, 'Prestation introuvable.');

  res.status(200).json({
    success: true,
    message: 'Prestation mise à jour avec succès.',
    data: service
  });
});

const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) throw new ApiError(404, 'Prestation introuvable.');

  res.status(200).json({
    success: true,
    message: 'Prestation supprimée avec succès.'
  });
});

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService
};
