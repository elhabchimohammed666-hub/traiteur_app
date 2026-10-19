const Testimonial = require('../models/Testimonial');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getTestimonials = asyncHandler(async (req, res) => {
  const isPrivileged = req.user && ['admin', 'staff'].includes(req.user.role);
  const filter = isPrivileged && req.query.all === 'true' ? {} : { isApproved: true };

  const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    data: testimonials
  });
});

const submitTestimonial = asyncHandler(async (req, res) => {
  const { authorName, city, eventType, rating, text } = req.body;
  if (!authorName || !text || !rating) {
    throw new ApiError(400, 'Nom, note et commentaire sont obligatoires.');
  }

  const testimonial = await Testimonial.create({
    authorName,
    city: city || 'Casablanca',
    eventType: eventType || 'mariage',
    rating: Number(rating),
    text,
    isApproved: false // Requires admin moderation
  });

  res.status(201).json({
    success: true,
    message: 'Merci pour votre avis ! Il sera visible dès validation par notre équipe.',
    data: testimonial
  });
});

const toggleApproveTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findById(req.params.id);
  if (!testimonial) throw new ApiError(404, 'Témoignage introuvable.');

  testimonial.isApproved = !testimonial.isApproved;
  await testimonial.save();

  res.status(200).json({
    success: true,
    message: `Avis ${testimonial.isApproved ? 'approuvé' : 'masqué'} avec succès.`,
    data: testimonial
  });
});

const deleteTestimonial = asyncHandler(async (req, res) => {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) throw new ApiError(404, 'Témoignage introuvable.');

  res.status(200).json({
    success: true,
    message: 'Avis supprimé.'
  });
});

module.exports = {
  getTestimonials,
  submitTestimonial,
  toggleApproveTestimonial,
  deleteTestimonial
};
