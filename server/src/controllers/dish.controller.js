const Dish = require('../models/Dish');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getDishes = asyncHandler(async (req, res) => {
  const { category, cuisineStyle, search, featured, vegetarian, activeOnly = 'true' } = req.query;
  const filter = {};

  if (activeOnly === 'true') {
    filter.isActive = true;
  } else if (activeOnly === 'false') {
    filter.isActive = false;
  }

  if (category) filter.category = category;
  if (cuisineStyle) filter.cuisineStyle = cuisineStyle;
  if (featured === 'true') filter.isFeatured = true;
  if (vegetarian === 'true') filter.isVegetarian = true;

  if (search) {
    filter.$or = [
      { 'name.fr': { $regex: search, $options: 'i' } },
      { 'name.ar': { $regex: search, $options: 'i' } },
      { 'description.fr': { $regex: search, $options: 'i' } }
    ];
  }

  const dishes = await Dish.find(filter).sort({ displayOrder: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: dishes
  });
});

const getDishByIdOrSlug = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const isObjectId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
  const dish = isObjectId
    ? await Dish.findById(idOrSlug)
    : await Dish.findOne({ slug: idOrSlug.toLowerCase() });

  if (!dish) throw new ApiError(404, 'Plat introuvable.');

  res.status(200).json({
    success: true,
    data: dish
  });
});

const createDish = asyncHandler(async (req, res) => {
  const { name, category, cuisineStyle, pricingMode, price, description, images, unitLabel, isVegetarian, allergens, isFeatured, displayOrder } = req.body;

  if (!name || !name.fr || !category || price === undefined) {
    throw new ApiError(400, 'Nom en français, catégorie et prix sont obligatoires.');
  }

  // generate slug from name.fr if not provided
  let slug = req.body.slug || name.fr.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const existingSlug = await Dish.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const dish = await Dish.create({
    name,
    slug,
    category,
    cuisineStyle,
    pricingMode: pricingMode || 'per_person',
    price,
    description,
    images: images || [],
    unitLabel,
    isVegetarian: !!isVegetarian,
    allergens: allergens || [],
    isFeatured: !!isFeatured,
    displayOrder: displayOrder || 0
  });

  res.status(201).json({
    success: true,
    message: 'Plat créé avec succès.',
    data: dish
  });
});

const updateDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!dish) throw new ApiError(404, 'Plat introuvable.');

  res.status(200).json({
    success: true,
    message: 'Plat mis à jour avec succès.',
    data: dish
  });
});

const deleteDish = asyncHandler(async (req, res) => {
  const dish = await Dish.findByIdAndDelete(req.params.id);
  if (!dish) throw new ApiError(404, 'Plat introuvable.');

  res.status(200).json({
    success: true,
    message: 'Plat supprimé avec succès.'
  });
});

module.exports = {
  getDishes,
  getDishByIdOrSlug,
  createDish,
  updateDish,
  deleteDish
};
