const Setting = require('../models/Setting');
const Package = require('../models/Package');
const Dish = require('../models/Dish');
const Equipment = require('../models/Equipment');
const Service = require('../models/Service');

/**
 * Calculate pricing estimate for a booking payload
 * @param {Object} payload
 * @returns {Promise<Object>}
 */
async function calculatePricing(payload) {
  const {
    packageId,
    guestsCount = 20,
    dishes = [],
    equipmentItems = [],
    services = [],
    city = 'Casablanca',
    rentalDays = 1,
    discount = 0
  } = payload;

  const setting = await Setting.findOne() || {
    deliveryZones: [
      { city: 'Casablanca', fee: 0 },
      { city: 'Rabat', fee: 1500 },
      { city: 'Marrakech', fee: 3500 },
      { city: 'Fès', fee: 4000 },
      { city: 'Tanger', fee: 4500 }
    ],
    depositPercent: 30,
    taxRate: 0
  };

  let foodTotal = 0;
  let selectedPackage = null;
  let packageSnapshot = null;

  // 1. Package calculation
  if (packageId) {
    selectedPackage = await Package.findById(packageId);
    if (selectedPackage) {
      const packageCost = (selectedPackage.pricePerPerson || 0) * guestsCount;
      foodTotal += packageCost;
      packageSnapshot = {
        name: selectedPackage.name?.fr || selectedPackage.name,
        pricePerPerson: selectedPackage.pricePerPerson
      };
    }
  }

  // 2. Extra dishes calculation
  const dishesDetail = [];
  if (Array.isArray(dishes) && dishes.length > 0) {
    for (const d of dishes) {
      const dishDoc = await Dish.findById(d.dish || d._id);
      if (dishDoc) {
        const unitPrice = d.unitPrice !== undefined ? d.unitPrice : dishDoc.price;
        const qty = Number(d.quantity) || 1;
        let lineCost = 0;

        if (dishDoc.pricingMode === 'per_person') {
          lineCost = unitPrice * guestsCount;
        } else if (dishDoc.pricingMode === 'per_unit') {
          lineCost = unitPrice * qty;
        } else {
          // fixed
          lineCost = unitPrice;
        }

        foodTotal += lineCost;
        dishesDetail.push({
          dish: dishDoc._id,
          name: dishDoc.name?.fr || dishDoc.name,
          pricingMode: dishDoc.pricingMode,
          unitPrice,
          quantity: qty,
          lineCost
        });
      }
    }
  }

  // 3. Equipment calculation
  let equipmentTotal = 0;
  const equipmentDetail = [];
  if (Array.isArray(equipmentItems) && equipmentItems.length > 0) {
    for (const eq of equipmentItems) {
      const eqDoc = await Equipment.findById(eq.equipment || eq._id);
      if (eqDoc) {
        const unitPrice = eq.unitPrice !== undefined ? eq.unitPrice : eqDoc.rentalPricePerDay;
        const qty = Number(eq.quantity) || 1;
        const days = Number(eq.days) || Number(rentalDays) || 1;
        const lineCost = qty * unitPrice * days;

        equipmentTotal += lineCost;
        equipmentDetail.push({
          equipment: eqDoc._id,
          name: eqDoc.name,
          quantity: qty,
          unitPrice,
          days,
          lineCost
        });
      }
    }
  }

  // 4. Services calculation
  let servicesTotal = 0;
  const servicesDetail = [];
  if (Array.isArray(services) && services.length > 0) {
    for (const s of services) {
      const sDoc = await Service.findById(s.service || s._id);
      if (sDoc) {
        const unitPrice = s.unitPrice !== undefined ? s.unitPrice : sDoc.price;
        const qty = Number(s.quantity) || 1;
        let lineCost = 0;

        if (sDoc.pricingMode === 'per_guest') {
          lineCost = unitPrice * guestsCount;
        } else if (sDoc.pricingMode === 'per_hour') {
          lineCost = unitPrice * (Number(s.hours) || qty || 4);
        } else if (sDoc.pricingMode === 'per_unit') {
          lineCost = unitPrice * qty;
        } else {
          // fixed
          lineCost = unitPrice;
        }

        servicesTotal += lineCost;
        servicesDetail.push({
          service: sDoc._id,
          name: sDoc.name?.fr || sDoc.name,
          pricingMode: sDoc.pricingMode,
          unitPrice,
          quantity: qty,
          lineCost
        });
      }
    }
  }

  // 5. Delivery fee
  let deliveryFee = 0;
  if (city && setting.deliveryZones) {
    const matchedZone = setting.deliveryZones.find(
      (z) => z.city && z.city.toLowerCase() === city.trim().toLowerCase()
    );
    if (matchedZone) {
      deliveryFee = matchedZone.fee || 0;
    }
  }

  // 6. Subtotal, Tax, Total, Deposit
  const subtotal = Math.max(0, foodTotal + equipmentTotal + servicesTotal + deliveryFee - (Number(discount) || 0));
  const taxRate = Number(setting.taxRate) || 0;
  const taxAmount = Math.round(subtotal * taxRate);
  const total = subtotal + taxAmount;
  const depositPercent = Number(setting.depositPercent) || 30;
  const deposit = Math.round((total * depositPercent) / 100);

  return {
    breakdown: {
      foodTotal,
      equipmentTotal,
      servicesTotal,
      deliveryFee,
      discount: Number(discount) || 0,
      subtotal,
      taxRate,
      taxAmount,
      total,
      depositPercent,
      deposit
    },
    packageSnapshot,
    dishesDetail,
    equipmentDetail,
    servicesDetail
  };
}

module.exports = { calculatePricing };
