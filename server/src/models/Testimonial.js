const mongoose = require('mongoose');
const { Schema } = mongoose;

const testimonialSchema = new Schema({
  authorName: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  eventType: {
    type: String,
    enum: ['mariage', 'fiancailles', 'famille', 'entreprise', 'religieux', 'anniversaire', 'autre'],
    default: 'mariage'
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, trim: true },
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

testimonialSchema.index({ isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
