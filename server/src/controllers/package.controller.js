const Package = require('../models/Package');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getPackages = asyncHandler(async (req, res) => {
  const { eventType, activeOnly = 'true' } = req.query;
  const filter = {};

  if (activeOnly === 'true') {
    filter.isActive = true;
  } else if (activeOnly === 'false') {
    filter.isActive = false;
  }

  if (eventType) {
    filter.eventTypes = eventType;
  }

  const packages = await Package.find(filter)
    .populate({
      path: 'courses.dishes',
      select: 'name slug category price images cuisineStyle isVegetarian'
    })
    .populate('includedEquipment.equipment', 'name category rentalPricePerDay')
    .sort({ displayOrder: 1, pricePerPerson: 1 });

  res.status(200).json({
    success: true,
    data: packages
  });
});

const getPackageByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  const pkg = await Package.findOne(query)
    .populate('courses.dishes')
    .populate('includedEquipment.equipment');

  if (!pkg) throw new ApiError(404, 'Formule introuvable.');

  res.status(200).json({
    success: true,
    data: pkg
  });
});

const createPackage = asyncHandler(async (req, res) => {
  const { name, pricePerPerson } = req.body;
  if (!name || !name.fr || pricePerPerson === undefined) {
    throw new ApiError(400, 'Nom en français et prix par personne sont requis.');
  }

  let slug = req.body.slug || name.fr.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existing = await Package.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const pkg = await Package.create({ ...req.body, slug });
  res.status(201).json({
    success: true,
    message: 'Formule créée avec succès.',
    data: pkg
  });
});

const updatePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!pkg) throw new ApiError(404, 'Formule introuvable.');

  res.status(200).json({
    success: true,
    message: 'Formule mise à jour avec succès.',
    data: pkg
  });
});

const deletePackage = asyncHandler(async (req, res) => {
  const pkg = await Package.findByIdAndDelete(req.params.id);
  if (!pkg) throw new ApiError(404, 'Formule introuvable.');

  res.status(200).json({
    success: true,
    message: 'Formule supprimée avec succès.'
  });
});

module.exports = {
  getPackages,
  getPackageByIdOrSlug,
  createPackage,
  updatePackage,
  deletePackage
};
