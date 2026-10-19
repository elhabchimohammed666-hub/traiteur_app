const mongoose = require('mongoose');
const { Schema } = mongoose;

const blockedDateSchema = new Schema({
  date: { type: Date, required: true, unique: true },
  reason: { type: String, trim: true },
  by: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('BlockedDate', blockedDateSchema);
