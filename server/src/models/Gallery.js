const mongoose = require('mongoose');
const { Schema } = mongoose;

const gallerySchema = new Schema({
  title: { type: String, required: true, trim: true },
  eventType: {
    type: String,
    enum: ['mariage', 'fiancailles', 'famille', 'entreprise', 'religieux', 'anniversaire', 'autre'],
    default: 'mariage'
  },
  eventDate: { type: Date },
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String
  }],
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

gallerySchema.index({ eventType: 1, isFeatured: 1, displayOrder: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);
