const Booking = require('../models/Booking');
const BlockedDate = require('../models/BlockedDate');
const Setting = require('../models/Setting');
const Equipment = require('../models/Equipment');

/**
 * Normalise a date to start of day (midnight UTC)
 */
function toMidnight(d) {
  const date = new Date(d);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/**
 * Check if a date is blocked or exceeds max events
 * @param {Date|string} dateStr
 * @param {string} [excludeBookingId]
 */
async function checkDateAvailability(dateStr, excludeBookingId = null) {
  const targetDate = toMidnight(dateStr);
  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  // Check blocked dates
  const isBlocked = await BlockedDate.findOne({
    date: { $gte: targetDate, $lt: nextDate }
  });

  if (isBlocked) {
    return {
      available: false,
      reason: isBlocked.reason || 'Cette date est indisponible (réservée ou bloquée par la direction).'
    };
  }

  // Check max events per day
  const setting = await Setting.findOne() || { maxEventsPerDay: 2 };
  const query = {
    'event.date': { $gte: targetDate, $lt: nextDate },
    status: { $in: ['confirmed', 'in_progress', 'quote_sent'] }
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const count = await Booking.countDocuments(query);
  if (count >= setting.maxEventsPerDay) {
    return {
      available: false,
      reason: `Capacité maximale atteinte pour cette date (${count}/${setting.maxEventsPerDay} événements).`
    };
  }

  return {
    available: true,
    currentBookingsCount: count,
    maxEventsPerDay: setting.maxEventsPerDay,
    status: count === 0 ? 'libre' : count >= setting.maxEventsPerDay ? 'complet' : 'presque_complet'
  };
}

/**
 * Calculate available quantity for all equipment or specific equipment on [start, end]
 * Uses day-by-day peak calculation as required by section 3.6 of CDC.
 */
async function getEquipmentAvailability(from, to, excludeBookingId = null) {
  const startDate = toMidnight(from);
  const endDate = toMidnight(to);

  // Ensure start <= end
  if (endDate < startDate) {
    throw new Error('La date de fin doit être postérieure ou égale à la date de début.');
  }

  // Fetch all active rentable equipment
  const equipments = await Equipment.find({ isActive: true });
  const equipMap = {};
  for (const eq of equipments) {
    equipMap[eq._id.toString()] = {
      equipment: eq,
      totalQuantity: eq.totalQuantity,
      outOfServiceQuantity: eq.outOfServiceQuantity || 0,
      usableQuantity: eq.usableQuantity,
      maxReservedOnPeriod: 0,
      availableQuantity: eq.usableQuantity
    };
  }

  // Find bookings overlapping [startDate, endDate]
  const matchFilter = {
    status: { $in: ['confirmed', 'in_progress'] },
    'rental.from': { $lte: endDate },
    'rental.to': { $gte: startDate }
  };

  if (excludeBookingId) {
    matchFilter._id = { $ne: excludeBookingId };
  }

  const overlappingBookings = await Booking.find(matchFilter).lean();

  // Day-by-day calculation to find the true peak reservation per item
  const dayMs = 24 * 60 * 60 * 1000;
  for (let current = new Date(startDate); current <= endDate; current = new Date(current.getTime() + dayMs)) {
    const currentDayReserved = {};

    for (const b of overlappingBookings) {
      const bFrom = toMidnight(b.rental?.from || b.event?.date);
      const bTo = toMidnight(b.rental?.to || b.event?.date);

      if (bFrom <= current && current <= bTo) {
        if (b.equipmentItems && Array.isArray(b.equipmentItems)) {
          for (const item of b.equipmentItems) {
            const eqId = item.equipment?.toString();
            if (eqId) {
              currentDayReserved[eqId] = (currentDayReserved[eqId] || 0) + (Number(item.quantity) || 0);
            }
          }
        }
      }
    }

    // Update peak for each equipment
    for (const [eqId, qty] of Object.entries(currentDayReserved)) {
      if (equipMap[eqId]) {
        if (qty > equipMap[eqId].maxReservedOnPeriod) {
          equipMap[eqId].maxReservedOnPeriod = qty;
        }
      }
    }
  }

  // Final available = usableQuantity - maxReservedOnPeriod
  for (const eqId of Object.keys(equipMap)) {
    const item = equipMap[eqId];
    item.availableQuantity = Math.max(0, item.usableQuantity - item.maxReservedOnPeriod);
  }

  return equipMap;
}

/**
 * Verify requested equipment items against availability
 * Returns array of conflict objects if any
 */
async function validateEquipmentRequest(equipmentItems, from, to, excludeBookingId = null) {
  if (!equipmentItems || equipmentItems.length === 0) return { isValid: true, conflicts: [] };

  const availability = await getEquipmentAvailability(from, to, excludeBookingId);
  const conflicts = [];

  for (const reqItem of equipmentItems) {
    const eqId = reqItem.equipment?.toString();
    const requestedQty = Number(reqItem.quantity) || 0;
    const availInfo = availability[eqId];

    if (!availInfo) {
      conflicts.push({
        equipmentId: eqId,
        name: reqItem.name || 'Article inconnu',
        requested: requestedQty,
        available: 0,
        message: `L'article n'existe plus ou est inactif.`
      });
      continue;
    }

    if (requestedQty > availInfo.availableQuantity) {
      conflicts.push({
        equipmentId: eqId,
        name: availInfo.equipment.name,
        requested: requestedQty,
        available: availInfo.availableQuantity,
        message: `Quantité demandée (${requestedQty}) supérieure à la disponibilité (${availInfo.availableQuantity}).`
      });
    }
  }

  return {
    isValid: conflicts.length === 0,
    conflicts
  };
}

module.exports = {
  checkDateAvailability,
  getEquipmentAvailability,
  validateEquipmentRequest,
  toMidnight
};
