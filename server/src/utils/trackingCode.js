const Counter = require('../models/Counter');

/**
 * Generate an atomic unique tracking code in format ELH-YYYY-NNNNN
 * @param {number} [year]
 * @returns {Promise<string>}
 */
async function generateTrackingCode(year = new Date().getFullYear()) {
  const result = await Counter.findOneAndUpdate(
    { name: 'booking_code', year },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const padded = String(result.seq).padStart(5, '0');
  return `ELH-${year}-${padded}`;
}

module.exports = { generateTrackingCode };
