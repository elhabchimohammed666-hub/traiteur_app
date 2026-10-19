const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const Dish = require('../models/Dish');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Counts
  const [
    totalBookings,
    newRequestsCount,
    upcoming7DaysCount,
    upcoming30DaysCount,
    confirmedBookings
  ] = await Promise.all([
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'new' }),
    Booking.countDocuments({
      'event.date': { $gte: now, $lte: in7Days },
      status: { $in: ['confirmed', 'in_progress', 'quote_sent'] }
    }),
    Booking.countDocuments({
      'event.date': { $gte: now, $lte: in30Days },
      status: { $in: ['confirmed', 'in_progress', 'quote_sent'] }
    }),
    Booking.find({ status: { $in: ['confirmed', 'in_progress', 'completed'] } })
  ]);

  // Financial metrics
  let totalEstimatedRevenue = 0;
  let totalCollectedRevenue = 0;
  let totalConfirmedCount = 0;

  for (const b of confirmedBookings) {
    totalEstimatedRevenue += b.pricing?.total || 0;
    const paid = (b.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);
    totalCollectedRevenue += paid;
    if (b.status === 'confirmed') totalConfirmedCount++;
  }

  const remainingBalance = Math.max(0, totalEstimatedRevenue - totalCollectedRevenue);
  const conversionRate = totalBookings > 0
    ? Math.round((confirmedBookings.length / totalBookings) * 100)
    : 0;

  // Recent new requests
  const recentNewRequests = await Booking.find({ status: 'new' })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('trackingCode customer event createdAt');

  res.status(200).json({
    success: true,
    data: {
      kpi: {
        totalBookings,
        newRequestsCount,
        upcoming7DaysCount,
        upcoming30DaysCount,
        totalEstimatedRevenue,
        totalCollectedRevenue,
        remainingBalance,
        conversionRate
      },
      recentNewRequests
    }
  });
});

const getRevenueMonthly = asyncHandler(async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const bookings = await Booking.find({
    'event.date': { $gte: startOfYear, $lte: endOfYear },
    status: { $nin: ['cancelled', 'rejected'] }
  });

  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthlyData = months.map((month, idx) => ({
    month,
    monthIndex: idx,
    estimated: 0,
    collected: 0,
    count: 0
  }));

  for (const b of bookings) {
    const m = new Date(b.event.date).getUTCMonth();
    monthlyData[m].estimated += b.pricing?.total || 0;
    const paid = (b.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);
    monthlyData[m].collected += paid;
    monthlyData[m].count += 1;
  }

  // Distribution by event type
  const eventTypeDist = {};
  for (const b of bookings) {
    const type = b.event.type || 'Autre';
    eventTypeDist[type] = (eventTypeDist[type] || 0) + 1;
  }

  res.status(200).json({
    success: true,
    data: {
      year,
      monthly: monthlyData,
      eventTypeDistribution: Object.entries(eventTypeDist).map(([name, value]) => ({ name, value }))
    }
  });
});

const getUpcomingEvents = asyncHandler(async (req, res) => {
  const days = Number(req.query.days) || 30;
  const now = new Date();
  const limitDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const upcoming = await Booking.find({
    'event.date': { $gte: now, $lte: limitDate },
    status: { $in: ['confirmed', 'in_progress', 'quote_sent'] }
  })
    .populate('package', 'name')
    .sort({ 'event.date': 1 });

  res.status(200).json({
    success: true,
    data: upcoming
  });
});

const getTopItems = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ status: { $nin: ['cancelled', 'rejected'] } });

  const dishFreq = {};
  const packageFreq = {};
  const equipFreq = {};

  for (const b of bookings) {
    if (b.packageSnapshot?.name) {
      packageFreq[b.packageSnapshot.name] = (packageFreq[b.packageSnapshot.name] || 0) + 1;
    }
    if (b.dishes) {
      for (const d of b.dishes) {
        if (d.name) dishFreq[d.name] = (dishFreq[d.name] || 0) + (d.quantity || 1);
      }
    }
    if (b.equipmentItems) {
      for (const eq of b.equipmentItems) {
        if (eq.name) equipFreq[eq.name] = (equipFreq[eq.name] || 0) + (eq.quantity || 1);
      }
    }
  }

  const sortTop = (dict) =>
    Object.entries(dict)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

  res.status(200).json({
    success: true,
    data: {
      topPackages: sortTop(packageFreq),
      topDishes: sortTop(dishFreq),
      topEquipment: sortTop(equipFreq)
    }
  });
});

const getStockAlerts = asyncHandler(async (req, res) => {
  const items = await Equipment.find({ isActive: true });
  const alerts = [];

  for (const item of items) {
    if (item.usableQuantity <= (item.lowStockThreshold || 5)) {
      alerts.push({
        id: item._id,
        name: item.name,
        category: item.category,
        usable: item.usableQuantity,
        threshold: item.lowStockThreshold || 5,
        type: 'low_stock'
      });
    }
    if (item.outOfServiceQuantity > 0) {
      alerts.push({
        id: item._id,
        name: item.name,
        category: item.category,
        outOfService: item.outOfServiceQuantity,
        type: 'repair'
      });
    }
  }

  res.status(200).json({
    success: true,
    data: alerts
  });
});

module.exports = {
  getDashboardStats,
  getRevenueMonthly,
  getUpcomingEvents,
  getTopItems,
  getStockAlerts
};
