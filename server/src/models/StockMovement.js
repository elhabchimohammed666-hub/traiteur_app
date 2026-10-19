const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockMovementSchema = new Schema({
  equipment: { type: Schema.Types.ObjectId, ref: 'Equipment', required: true },
  type: {
    type: String,
    enum: ['purchase', 'loss', 'breakage', 'repair_out', 'repair_in', 'adjustment'],
    required: true
  },
  quantity: { type: Number, required: true }, // positif ou négatif
  reason: { type: String, trim: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking' },
  by: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

stockMovementSchema.index({ equipment: 1, createdAt: -1 });

module.exports = mongoose.model('StockMovement', stockMovementSchema);
