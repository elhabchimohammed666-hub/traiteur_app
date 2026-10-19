const mongoose = require('mongoose');
const { Schema } = mongoose;

const settingSchema = new Schema({
  businessName: { type: String, default: 'Elhabchi Traiteur' },
  phone: { type: String, default: '+212 705 782 737' },
  email: { type: String, default: 'contact@elhabchitraiteur.ma' },
  address: { type: String, default: 'Boulevard d’Anfa, Casablanca, Maroc' },
  whatsappNumber: { type: String, default: '212705782737' },
  currency: { type: String, default: 'MAD' },
  minNoticeDays: { type: Number, default: 7 },
  depositPercent: { type: Number, default: 30 },
  taxRate: { type: Number, default: 0 },
  setupDaysBefore: { type: Number, default: 1 },
  returnDaysAfter: { type: Number, default: 1 },
  maxEventsPerDay: { type: Number, default: 2 },
  quoteValidityDays: { type: Number, default: 15 },
  deliveryZones: [{
    city: { type: String, required: true },
    fee: { type: Number, default: 0 }
  }],
  cancellationPolicy: {
    fr: { type: String, default: "Annulation gratuite jusqu'à 30 jours avant l'événement. Au-delà, l'acompte de 30% est conservé." },
    ar: { type: String, default: "إلغاء مجاني حتى 30 يومًا قبل موعد الحفل. بعد ذلك، يتم الاحتفاظ بمبلغ العربون البالغ 30%." }
  },
  social: {
    instagram: { type: String, default: 'https://instagram.com/elhabchitraiteur' },
    facebook: { type: String, default: 'https://facebook.com/elhabchitraiteur' },
    tiktok: { type: String, default: 'https://tiktok.com/@elhabchitraiteur' }
  }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
