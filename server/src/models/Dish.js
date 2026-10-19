const mongoose = require('mongoose');
const { Schema } = mongoose;

const i18nSchema = {
  fr: { type: String, required: true, trim: true },
  ar: { type: String, trim: true },
  en: { type: String, trim: true }
};

const dishSchema = new Schema({
  name: i18nSchema,
  slug: { type: String, unique: true, required: true, lowercase: true, trim: true },
  description: {
    fr: { type: String, trim: true },
    ar: { type: String, trim: true },
    en: { type: String, trim: true }
  },
  category: {
    type: String,
    required: true,
    enum: ['entree', 'plat', 'accompagnement', 'dessert', 'patisserie', 'boisson', 'buffet', 'mechoui', 'autre']
  },
  cuisineStyle: {
    type: String,
    enum: ['traditionnel', 'moderne', 'fusion'],
    default: 'traditionnel'
  },
  pricingMode: {
    type: String,
    enum: ['per_person', 'per_unit', 'fixed'],
    default: 'per_person'
  },
  price: { type: Number, required: true, min: 0 },
  unitLabel: { type: String, trim: true }, // ex. 'pièce', 'plateau', 'portion'
  images: [{ url: String, publicId: String }],
  isVegetarian: { type: Boolean, default: false },
  allergens: [{ type: String, trim: true }],
  leadTimeHours: { type: Number, default: 24 },
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

dishSchema.index({ category: 1, cuisineStyle: 1, isActive: 1 });

module.exports = mongoose.model('Dish', dishSchema);
