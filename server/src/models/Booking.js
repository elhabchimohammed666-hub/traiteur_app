const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  trackingCode: { type: String, unique: true, required: true, trim: true }, // ELH-2026-00042
  kind: { type: String, enum: ['booking', 'custom_quote'], default: 'booking' },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'quote_sent', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rejected']
  },
  source: { type: String, enum: ['website', 'whatsapp', 'admin'], default: 'website' },
  customer: {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    isCompany: { type: Boolean, default: false },
    companyName: { type: String, trim: true },
    preferredContact: { type: String, enum: ['whatsapp', 'phone', 'email'], default: 'whatsapp' }
  },
  event: {
    type: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, default: '19:00' },
    endTime: { type: String, default: '01:00' },
    guestsCount: { type: Number, required: true, min: 1 },
    city: { type: String, trim: true, default: 'Casablanca' },
    address: { type: String, trim: true },
    venueType: { type: String, trim: true, default: 'salle' }
  },
  rental: {
    from: { type: Date },
    to: { type: Date }
  }, // période de blocage du matériel
  package: { type: Schema.Types.ObjectId, ref: 'Package' },
  packageSnapshot: {
    name: String,
    pricePerPerson: Number
  },
  dishes: [{
    dish: { type: Schema.Types.ObjectId, ref: 'Dish' },
    name: String,
    pricingMode: String,
    unitPrice: Number,
    quantity: { type: Number, default: 1 }
  }],
  equipmentItems: [{
    equipment: { type: Schema.Types.ObjectId, ref: 'Equipment' },
    name: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    days: { type: Number, default: 1 }
  }],
  services: [{
    service: { type: Schema.Types.ObjectId, ref: 'Service' },
    name: String,
    pricingMode: String,
    unitPrice: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 }
  }],
  specialRequests: { type: String, trim: true },
  pricing: {
    foodTotal: { type: Number, default: 0 },
    equipmentTotal: { type: Number, default: 0 },
    servicesTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    deposit: { type: Number, default: 0 }
  },
  payments: [{
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'virement', 'cheque', 'carte', 'autre'], default: 'virement' },
    paidAt: { type: Date, default: Date.now },
    note: String,
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  internalNotes: [{
    text: { type: String, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    at: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: { type: String, required: true },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    reason: String
  }],
  whatsappClickedAt: Date,
  quoteSentAt: Date,
  quoteValidUntil: Date,
  consentAcceptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

bookingSchema.index({ status: 1, 'rental.from': 1, 'rental.to': 1 });
bookingSchema.index({ 'event.date': 1 });
bookingSchema.index({ 'customer.phone': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
