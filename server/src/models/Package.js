const mongoose = require('mongoose');
const { Schema } = mongoose;

const i18nSchema = {
  fr: { type: String, required: true, trim: true },
  ar: { type: String, trim: true },
  en: { type: String, trim: true }
};

const packageSchema = new Schema({
  name: i18nSchema,
  slug: { type: String, unique: true, required: true, lowercase: true, trim: true },
  description: {
    fr: { type: String, trim: true },
    ar: { type: String, trim: true },
    en: { type: String, trim: true }
  },
  eventTypes: [{
    type: String,
    enum: ['mariage', 'fiancailles', 'famille', 'entreprise', 'religieux', 'anniversaire', 'autre']
  }],
  pricePerPerson: { type: Number, required: true, min: 0 },
  minGuests: { type: Number, default: 20 },
  maxGuests: { type: Number },
  courses: [{
    label: { type: String, required: true }, // 'Entrées', 'Plats', 'Desserts', etc.
    choose: { type: Number, default: 1 },
    dishes: [{ type: Schema.Types.ObjectId, ref: 'Dish' }]
  }],
  includedEquipment: [{
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    perGuest: { type: Number, default: 0 },
    fixed: { type: Number, default: 0 }
  }],
  includedServices: [{ type: String, trim: true }], // ex. 'Service en salle', 'Mise en place'
  images: [{ url: String, publicId: String }],
  badge: { type: String, trim: true }, // 'Populaire', 'Premium', 'Excellence'
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

packageSchema.index({ isActive: 1, displayOrder: 1 });

module.exports = mongoose.model('Package', packageSchema);
