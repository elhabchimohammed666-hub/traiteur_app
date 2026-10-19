const Equipment = require('../models/Equipment');
const StockMovement = require('../models/StockMovement');
const Booking = require('../models/Booking');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getEquipmentAvailability, toMidnight } = require('../services/availability.service');

const getEquipment = asyncHandler(async (req, res) => {
  const { category, isRentable, search, activeOnly = 'true' } = req.query;
  const filter = {};

  if (activeOnly === 'true') filter.isActive = true;
  if (category) filter.category = category;
  if (isRentable !== undefined) filter.isRentable = isRentable === 'true';

  // Public users only see rentable items with limited fields
  const isPrivileged = req.user && ['admin', 'staff'].includes(req.user.role);
  if (!isPrivileged) {
    filter.isRentable = true;
    filter.isActive = true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } }
    ];
  }

  let query = Equipment.find(filter).sort({ category: 1, name: 1 });
  if (!isPrivileged) {
    query = query.select('name category description images rentalPricePerDay unit usableQuantity totalQuantity isRentable');
  }

  const items = await query;
  res.status(200).json({
    success: true,
    data: items
  });
});

const getEquipmentAvailabilityController = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    throw new ApiError(400, 'Les paramètres "from" et "to" (dates ISO YYYY-MM-DD) sont requis.');
  }

  const availability = await getEquipmentAvailability(new Date(from), new Date(to));
  res.status(200).json({
    success: true,
    data: availability
  });
});

const getEquipmentById = asyncHandler(async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Article de matériel introuvable.');

  res.status(200).json({
    success: true,
    data: item
  });
});

const createEquipment = asyncHandler(async (req, res) => {
  const { name, category, rentalPricePerDay, totalQuantity, outOfServiceQuantity = 0 } = req.body;
  if (!name || !category || rentalPricePerDay === undefined || totalQuantity === undefined) {
    throw new ApiError(400, 'Nom, catégorie, prix de location et quantité totale sont requis.');
  }

  const equipment = await Equipment.create(req.body);

  // Record initial stock movement
  await StockMovement.create({
    equipment: equipment._id,
    type: 'purchase',
    quantity: totalQuantity,
    reason: 'Stock initial à la création de l\'article',
    by: req.user?._id
  });

  res.status(201).json({
    success: true,
    message: 'Article ajouté au matériel avec succès.',
    data: equipment
  });
});

const updateEquipment = asyncHandler(async (req, res) => {
  const item = await Equipment.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Article introuvable.');

  // If user is staff (not admin), they cannot modify pricing
  if (req.user?.role === 'staff' && req.body.rentalPricePerDay !== undefined && req.body.rentalPricePerDay !== item.rentalPricePerDay) {
    throw new ApiError(403, 'Seul un administrateur peut modifier le tarif de location.');
  }

  Object.assign(item, req.body);
  await item.save();

  res.status(200).json({
    success: true,
    message: 'Article mis à jour avec succès.',
    data: item
  });
});

const adjustStock = asyncHandler(async (req, res) => {
  const { type, quantity, reason } = req.body;
  if (!type || quantity === undefined || !reason) {
    throw new ApiError(400, 'Type de mouvement, quantité et motif sont obligatoires.');
  }

  const item = await Equipment.findById(req.params.id);
  if (!item) throw new ApiError(404, 'Article introuvable.');

  const parsedQty = Number(quantity);

  if (type === 'purchase') {
    item.totalQuantity += parsedQty;
  } else if (type === 'loss' || type === 'breakage') {
    item.totalQuantity = Math.max(0, item.totalQuantity - parsedQty);
  } else if (type === 'repair_out') {
    item.outOfServiceQuantity = (item.outOfServiceQuantity || 0) + parsedQty;
  } else if (type === 'repair_in') {
    item.outOfServiceQuantity = Math.max(0, (item.outOfServiceQuantity || 0) - parsedQty);
  } else if (type === 'adjustment') {
    item.totalQuantity = parsedQty;
  }

  await item.save();

  const movement = await StockMovement.create({
    equipment: item._id,
    type,
    quantity: parsedQty,
    reason,
    by: req.user?._id
  });

  res.status(200).json({
    success: true,
    message: 'Stock ajusté avec succès.',
    data: {
      equipment: item,
      movement
    }
  });
});

const deleteEquipment = asyncHandler(async (req, res) => {
  const item = await Equipment.findByIdAndDelete(req.params.id);
  if (!item) throw new ApiError(404, 'Article introuvable.');

  // also remove movements
  await StockMovement.deleteMany({ equipment: req.params.id });

  res.status(200).json({
    success: true,
    message: 'Article supprimé du stock.'
  });
});

const getEquipmentMovements = asyncHandler(async (req, res) => {
  const movements = await StockMovement.find({ equipment: req.params.id })
    .populate('by', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: movements
  });
});

const getEquipmentCalendar = asyncHandler(async (req, res) => {
  const { month } = req.query; // YYYY-MM
  const eqId = req.params.id;

  const now = month ? new Date(`${month}-01T00:00:00Z`) : new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

  const bookings = await Booking.find({
    status: { $in: ['confirmed', 'in_progress', 'quote_sent'] },
    'rental.from': { $lte: endOfMonth },
    'rental.to': { $gte: startOfMonth },
    'equipmentItems.equipment': eqId
  }).select('trackingCode customer event rental equipmentItems status');

  const reservationsByDay = {};
  for (const b of bookings) {
    const item = b.equipmentItems.find((e) => e.equipment.toString() === eqId);
    if (!item) continue;

    const from = new Date(Math.max(toMidnight(b.rental.from).getTime(), startOfMonth.getTime()));
    const to = new Date(Math.min(toMidnight(b.rental.to).getTime(), endOfMonth.getTime()));

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      if (!reservationsByDay[dateKey]) reservationsByDay[dateKey] = [];
      reservationsByDay[dateKey].push({
        bookingId: b._id,
        trackingCode: b.trackingCode,
        customerName: b.customer.fullName,
        quantity: item.quantity,
        status: b.status
      });
    }
  }

  res.status(200).json({
    success: true,
    data: reservationsByDay
  });
});

const getEquipmentAlerts = asyncHandler(async (req, res) => {
  const items = await Equipment.find({ isActive: true });
  const alerts = [];

  for (const item of items) {
    const usable = item.usableQuantity;
    const threshold = item.lowStockThreshold || 5;

    if (usable <= threshold) {
      alerts.push({
        type: 'low_stock',
        severity: usable === 0 ? 'critical' : 'warning',
        equipment: item,
        message: `Stock disponible faible (${usable} restant${usable > 1 ? 's' : ''}, seuil : ${threshold}).`
      });
    }

    if (item.outOfServiceQuantity > 0) {
      alerts.push({
        type: 'repair_needed',
        severity: 'info',
        equipment: item,
        message: `${item.outOfServiceQuantity} unité(s) actuellement hors service ou en réparation.`
      });
    }
  }

  res.status(200).json({
    success: true,
    data: alerts
  });
});

module.exports = {
  getEquipment,
  getEquipmentAvailabilityController,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  adjustStock,
  deleteEquipment,
  getEquipmentMovements,
  getEquipmentCalendar,
  getEquipmentAlerts
};
