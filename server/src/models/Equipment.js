const mongoose = require('mongoose');
const { Schema } = mongoose;

const equipmentSchema = new Schema({
  name: { type: String, required: true, trim: true },
  sku: { type: String, unique: true, sparse: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['tables', 'chaises', 'vaisselle', 'tentes', 'decoration', 'cuisine', 'eclairage_son', 'linge', 'autre']
  },
  description: { type: String, trim: true },
  images: [{ url: String, publicId: String }],
  rentalPricePerDay: { type: Number, required: true, min: 0 }, // MAD / unité / jour
  replacementCost: { type: Number, min: 0, default: 0 }, // casse / perte
  totalQuantity: { type: Number, required: true, min: 0 },
  outOfServiceQuantity: { type: Number, default: 0, min: 0 }, // réparation, hors service
  unit: { type: String, default: 'pièce', trim: true },
  condition: {
    type: String,
    enum: ['excellent', 'bon', 'moyen', 'a_reparer'],
    default: 'bon'
  },
  lowStockThreshold: { type: Number, default: 5 },
  storageLocation: { type: String, trim: true },
  isRentable: { type: Boolean, default: true }, // visible dans le simulateur
  isActive: { type: Boolean, default: true },
  notes: { type: String, trim: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

equipmentSchema.virtual('usableQuantity').get(function () {
  return Math.max(0, (this.totalQuantity || 0) - (this.outOfServiceQuantity || 0));
});

equipmentSchema.index({ category: 1, isActive: 1 });
equipmentSchema.index({ isRentable: 1, isActive: 1 });

module.exports = mongoose.model('Equipment', equipmentSchema);
