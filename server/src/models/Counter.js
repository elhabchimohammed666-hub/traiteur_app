const mongoose = require('mongoose');
const { Schema } = mongoose;

const counterSchema = new Schema({
  name: { type: String, required: true },
  year: { type: Number, required: true },
  seq: { type: Number, default: 0 }
});

counterSchema.index({ name: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Counter', counterSchema);
