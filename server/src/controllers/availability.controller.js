const BlockedDate = require('../models/BlockedDate');
const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { checkDateAvailability, toMidnight } = require('../services/availability.service');

const getMonthlyCalendar = asyncHandler(async (req, res) => {
  const { month } = req.query; // YYYY-MM
  const setting = await Setting.findOne() || { maxEventsPerDay: 2 };

  const now = month ? new Date(`${month}-01T00:00:00Z`) : new Date();
  const year = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const startOfMonth = new Date(Date.UTC(year, m, 1));
  const endOfMonth = new Date(Date.UTC(year, m + 1, 0, 23, 59, 59));

  // Get blocked dates in month
  const blockedList = await BlockedDate.find({
    date: { $gte: startOfMonth, $lte: endOfMonth }
  });
  const blockedMap = {};
  blockedList.forEach((b) => {
    const key = b.date.toISOString().split('T')[0];
    blockedMap[key] = b.reason || 'Date bloquée';
  });

  // Get bookings count per day in month
  const bookings = await Booking.find({
    'event.date': { $gte: startOfMonth, $lte: endOfMonth },
    status: { $in: ['confirmed', 'in_progress', 'quote_sent'] }
  }).select('event.date status');

  const countMap = {};
  bookings.forEach((b) => {
    const key = new Date(b.event.date).toISOString().split('T')[0];
    countMap[key] = (countMap[key] || 0) + 1;
  });

  const daysResult = {};
  const totalDays = endOfMonth.getUTCDate();

  for (let day = 1; day <= totalDays; day++) {
    const dStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (blockedMap[dStr]) {
      daysResult[dStr] = { status: 'bloque', count: 0, reason: blockedMap[dStr] };
    } else {
      const cnt = countMap[dStr] || 0;
      if (cnt === 0) {
        daysResult[dStr] = { status: 'libre', count: 0 };
      } else if (cnt >= setting.maxEventsPerDay) {
        daysResult[dStr] = { status: 'complet', count: cnt };
      } else {
        daysResult[dStr] = { status: 'presque_complet', count: cnt };
      }
    }
  }

  res.status(200).json({
    success: true,
    data: {
      month: `${year}-${String(m + 1).padStart(2, '0')}`,
      maxEventsPerDay: setting.maxEventsPerDay,
      days: daysResult
    }
  });
});

const getDateAvailability = asyncHandler(async (req, res) => {
  const { date } = req.query;
  if (!date) throw new ApiError(400, 'Paramètre "date" requis (YYYY-MM-DD).');

  const result = await checkDateAvailability(date);
  res.status(200).json({
    success: true,
    data: result
  });
});

const getBlockedDates = asyncHandler(async (req, res) => {
  const list = await BlockedDate.find().populate('by', 'fullName email').sort({ date: 1 });
  res.status(200).json({
    success: true,
    data: list
  });
});

const blockDate = asyncHandler(async (req, res) => {
  const { date, reason } = req.body;
  if (!date) throw new ApiError(400, 'La date est requise.');

  const targetDate = toMidnight(date);
  const existing = await BlockedDate.findOne({ date: targetDate });
  if (existing) throw new ApiError(409, 'Cette date est déjà bloquée.');

  const blocked = await BlockedDate.create({
    date: targetDate,
    reason: reason || 'Bloqué par l’administrateur',
    by: req.user?._id
  });

  res.status(201).json({
    success: true,
    message: 'Date bloquée avec succès.',
    data: blocked
  });
});

const unblockDate = asyncHandler(async (req, res) => {
  const blocked = await BlockedDate.findByIdAndDelete(req.params.id);
  if (!blocked) throw new ApiError(404, 'Enregistrement de date bloquée introuvable.');

  res.status(200).json({
    success: true,
    message: 'Date débloquée avec succès.'
  });
});

module.exports = {
  getMonthlyCalendar,
  getDateAvailability,
  getBlockedDates,
  blockDate,
  unblockDate
};
