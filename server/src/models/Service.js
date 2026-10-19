const mongoose = require('mongoose');
const { Schema } = mongoose;

const i18nSchema = {
  fr: { type: String, required: true, trim: true },
  ar: { type: String, trim: true },
  en: { type: String, trim: true }
};

const serviceSchema = new Schema({
  name: i18nSchema,
  description: {
    fr: { type: String, trim: true },
    ar: { type: String, trim: true },
    en: { type: String, trim: true }
  },
  category: {
    type: String,
    enum: ['personnel', 'decoration', 'animation', 'logistique', 'autre'],
    required: true
  },
  pricingMode: {
    type: String,
    enum: ['fixed', 'per_hour', 'per_guest', 'per_unit'],
    default: 'fixed'
  },
  price: { type: Number, required: true, min: 0 },
  unitLabel: { type: String, trim: true }, // ex. 'par serveur', 'par heure', 'forfait'
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
