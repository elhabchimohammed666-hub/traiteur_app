const Gallery = require('../models/Gallery');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getGallery = asyncHandler(async (req, res) => {
  const { eventType, featured } = req.query;
  const filter = {};
  if (eventType) filter.eventType = eventType;
  if (featured === 'true') filter.isFeatured = true;

  const items = await Gallery.find(filter).sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json({
    success: true,
    data: items
  });
});

const createGalleryItem = asyncHandler(async (req, res) => {
  const { title, images, eventType, isFeatured, displayOrder } = req.body;
  if (!title || !images || images.length === 0) {
    throw new ApiError(400, 'Titre et images sont obligatoires.');
  }

  const item = await Gallery.create(req.body);
  res.status(201).json({
    success: true,
    message: 'Élément ajouté à la galerie.',
    data: item
  });
});

const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) throw new ApiError(404, 'Élément de galerie introuvable.');

  res.status(200).json({
    success: true,
    message: 'Élément mis à jour.',
    data: item
  });
});

const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Élément de galerie introuvable.');

  res.status(200).json({
    success: true,
    message: 'Élément supprimé de la galerie.'
  });
});

module.exports = {
  getGallery,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem
};
