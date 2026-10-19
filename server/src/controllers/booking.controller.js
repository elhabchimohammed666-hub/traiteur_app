const Booking = require('../models/Booking');
const Setting = require('../models/Setting');
const Package = require('../models/Package');
const Dish = require('../models/Dish');
const Equipment = require('../models/Equipment');
const Service = require('../models/Service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateTrackingCode } = require('../utils/trackingCode');
const { calculatePricing } = require('../services/pricing.service');
const { validateEquipmentRequest, checkDateAvailability, toMidnight } = require('../services/availability.service');
const { buildWhatsAppUrl, buildAdminReplyUrl, buildMessage } = require('../services/whatsapp.service');
const { generateBookingPDF } = require('../services/pdf.service');
const { notifyAdminNewBooking, notifyClientBookingReceived, sendEmail } = require('../services/notification.service');

/**
 * Public: Calculate price and stock availability estimate without creating
 */
const estimateBooking = asyncHandler(async (req, res) => {
  const { event, packageId, dishes, equipmentItems, services, city } = req.body;

  let availability = { available: true };
  if (event?.date) {
    availability = await checkDateAvailability(event.date);
  }

  const pricing = await calculatePricing({
    packageId,
    guestsCount: Number(event?.guestsCount) || 20,
    dishes,
    equipmentItems,
    services,
    city: city || event?.city || 'Casablanca'
  });

  let equipmentCheck = { isValid: true, conflicts: [] };
  if (event?.date && equipmentItems?.length > 0) {
    const from = toMidnight(event.date);
    equipmentCheck = await validateEquipmentRequest(equipmentItems, from, from);
  }

  res.status(200).json({
    success: true,
    data: {
      pricing: pricing.breakdown,
      packageSnapshot: pricing.packageSnapshot,
      dishesDetail: pricing.dishesDetail,
      equipmentDetail: pricing.equipmentDetail,
      servicesDetail: pricing.servicesDetail,
      dateAvailability: availability,
      equipmentAvailability: equipmentCheck
    }
  });
});

/**
 * Public: Create booking request, return trackingCode and whatsappUrl
 */
const createPublicBooking = asyncHandler(async (req, res) => {
  const { customer, event, package: packageId, dishes = [], equipmentItems = [], services = [], specialRequests, consent } = req.body;

  if (!customer?.fullName || !customer?.phone) {
    throw new ApiError(400, 'Le nom et le numéro de téléphone sont obligatoires.');
  }
  if (!event?.date || !event?.guestsCount || !event?.type) {
    throw new ApiError(400, 'Le type d’événement, la date et le nombre d’invités sont obligatoires.');
  }

  // RG3: Minimum advance notice
  const setting = await Setting.findOne() || { minNoticeDays: 7, setupDaysBefore: 1, returnDaysAfter: 1 };
  const eventDate = toMidnight(event.date);
  const now = new Date();
  const diffDays = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));
  if (diffDays < (setting.minNoticeDays || 7)) {
    throw new ApiError(400, `Pour un événement dans moins de ${setting.minNoticeDays} jours, veuillez contacter directement notre équipe via WhatsApp.`);
  }

  // Calculate pricing & snapshot
  const pricingResult = await calculatePricing({
    packageId,
    guestsCount: Number(event.guestsCount),
    dishes,
    equipmentItems,
    services,
    city: event.city || 'Casablanca'
  });

  // Calculate rental period with setup / return days
  const setupDays = setting.setupDaysBefore || 1;
  const returnDays = setting.returnDaysAfter || 1;
  const rentalFrom = new Date(eventDate.getTime() - setupDays * 24 * 60 * 60 * 1000);
  const rentalTo = new Date(eventDate.getTime() + returnDays * 24 * 60 * 60 * 1000);

  const eventYear = eventDate.getFullYear() || new Date().getFullYear();
  const trackingCode = await generateTrackingCode(eventYear);

  const booking = await Booking.create({
    trackingCode,
    kind: packageId ? 'booking' : 'custom_quote',
    status: 'new',
    source: 'website',
    customer: {
      fullName: customer.fullName,
      phone: customer.phone,
      email: customer.email,
      isCompany: !!customer.isCompany,
      companyName: customer.companyName,
      preferredContact: customer.preferredContact || 'whatsapp'
    },
    event: {
      type: event.type,
      date: eventDate,
      startTime: event.startTime || '19:00',
      endTime: event.endTime || '01:00',
      guestsCount: Number(event.guestsCount),
      city: event.city || 'Casablanca',
      address: event.address || '',
      venueType: event.venueType || 'salle'
    },
    rental: {
      from: rentalFrom,
      to: rentalTo
    },
    package: packageId || undefined,
    packageSnapshot: pricingResult.packageSnapshot,
    dishes: pricingResult.dishesDetail.map((d) => ({
      dish: d.dish,
      name: d.name,
      pricingMode: d.pricingMode,
      unitPrice: d.unitPrice,
      quantity: d.quantity
    })),
    equipmentItems: pricingResult.equipmentDetail.map((eq) => ({
      equipment: eq.equipment,
      name: eq.name,
      quantity: eq.quantity,
      unitPrice: eq.unitPrice,
      days: eq.days
    })),
    services: pricingResult.servicesDetail.map((s) => ({
      service: s.service,
      name: s.name,
      pricingMode: s.pricingMode,
      unitPrice: s.unitPrice,
      quantity: s.quantity
    })),
    specialRequests,
    pricing: pricingResult.breakdown,
    statusHistory: [{
      status: 'new',
      at: new Date(),
      reason: 'Demande soumise en ligne par le client'
    }],
    consentAcceptedAt: consent ? new Date() : undefined
  });

  const whatsappUrl = buildWhatsAppUrl(booking);

  // Send asynchronous email notifications
  notifyAdminNewBooking(booking).catch(console.error);
  if (booking.customer.email) {
    notifyClientBookingReceived(booking).catch(console.error);
  }

  res.status(201).json({
    success: true,
    message: 'Votre demande a bien été enregistrée.',
    data: {
      trackingCode: booking.trackingCode,
      status: booking.status,
      pricing: booking.pricing,
      whatsappUrl,
      bookingId: booking._id
    }
  });
});

/**
 * Public: Track WhatsApp click
 */
const recordWhatsAppClick = asyncHandler(async (req, res) => {
  const { code } = req.params;
  await Booking.findOneAndUpdate(
    { trackingCode: code },
    { whatsappClickedAt: new Date() }
  );
  res.status(200).json({ success: true });
});

/**
 * Public: Track booking status by code & phone
 */
const trackBooking = asyncHandler(async (req, res) => {
  const { code, phone } = req.query;
  if (!code || !phone) {
    throw new ApiError(400, 'Le code de suivi et le numéro de téléphone sont requis.');
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const booking = await Booking.findOne({ trackingCode: code.trim().toUpperCase() })
    .populate('package', 'name description images')
    .populate('dishes.dish', 'name images')
    .populate('equipmentItems.equipment', 'name images')
    .populate('services.service', 'name');

  if (!booking) {
    throw new ApiError(404, 'Aucune demande trouvée pour cette référence.');
  }

  const bookingPhone = (booking.customer?.phone || '').replace(/[^0-9]/g, '');
  // Match last 8 digits to handle country prefix differences (+212 / 06...)
  const matchA = cleanPhone.slice(-8);
  const matchB = bookingPhone.slice(-8);

  if (matchA !== matchB) {
    throw new ApiError(403, 'Le numéro de téléphone ne correspond pas au dossier.');
  }

  res.status(200).json({
    success: true,
    data: booking
  });
});

/**
 * Public: Client response from tracking page (Accept, Request change, Cancel)
 */
const respondToBooking = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const { action, phone, note } = req.body; // action: 'accept' | 'request_modification' | 'cancel'

  if (!code || !phone) {
    throw new ApiError(400, 'Code de suivi et téléphone requis.');
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const booking = await Booking.findOne({ trackingCode: code.toUpperCase() });

  if (!booking) throw new ApiError(404, 'Dossier introuvable.');

  const bookingPhone = (booking.customer?.phone || '').replace(/[^0-9]/g, '');
  if (cleanPhone.slice(-8) !== bookingPhone.slice(-8)) {
    throw new ApiError(403, 'Numéro de téléphone non autorisé.');
  }

  if (action === 'cancel') {
    booking.status = 'cancelled';
    booking.statusHistory.push({
      status: 'cancelled',
      at: new Date(),
      reason: note || 'Annulation demandée en ligne par le client'
    });
    await booking.save();
    return res.status(200).json({
      success: true,
      message: 'Votre réservation a été annulée conformément à nos conditions.',
      data: booking
    });
  }

  if (action === 'accept') {
    booking.statusHistory.push({
      status: booking.status,
      at: new Date(),
      reason: 'Devis accepté en ligne par le client (en attente du règlement de l’acompte).'
    });
    await booking.save();
    return res.status(200).json({
      success: true,
      message: 'Merci d’avoir accepté le devis ! Notre équipe vous contactera pour finaliser l’acompte.',
      data: booking
    });
  }

  if (action === 'request_modification') {
    booking.statusHistory.push({
      status: booking.status,
      at: new Date(),
      reason: `Demande de modification client : ${note || 'Souhaite ajuster la proposition'}`
    });
    await booking.save();
    return res.status(200).json({
      success: true,
      message: 'Votre demande de modification a été transmise à notre équipe.',
      data: booking
    });
  }

  throw new ApiError(400, 'Action invalide.');
});

/**
 * Public: Contact form
 */
const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !phone || !message) {
    throw new ApiError(400, 'Nom, téléphone et message sont obligatoires.');
  }

  await sendEmail({
    to: 'contact@elhabchitraiteur.ma',
    subject: `[Contact Vitrine] ${subject || 'Nouveau message'} - ${name}`,
    text: `Message de : ${name}\nTél : ${phone}\nEmail : ${email || 'Non renseigné'}\n\n${message}`
  });

  res.status(200).json({
    success: true,
    message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
  });
});

/**
 * Admin: Get bookings with filters and search
 */
const getAdminBookings = asyncHandler(async (req, res) => {
  const { status, from, to, eventType, city, q, page = 1, limit = 20 } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (eventType) filter['event.type'] = eventType;
  if (city) filter['event.city'] = { $regex: city, $options: 'i' };

  if (from || to) {
    filter['event.date'] = {};
    if (from) filter['event.date'].$gte = new Date(from);
    if (to) filter['event.date'].$lte = new Date(to);
  }

  if (q) {
    filter.$or = [
      { trackingCode: { $regex: q, $options: 'i' } },
      { 'customer.fullName': { $regex: q, $options: 'i' } },
      { 'customer.phone': { $regex: q, $options: 'i' } },
      { 'customer.email': { $regex: q, $options: 'i' } }
    ];
  }

  const p = Math.max(1, Number(page));
  const l = Math.max(1, Number(limit));
  const skip = (p - 1) * l;

  const [total, bookings] = await Promise.all([
    Booking.countDocuments(filter),
    Booking.find(filter)
      .populate('package', 'name pricePerPerson')
      .sort({ 'event.date': -1, createdAt: -1 })
      .skip(skip)
      .limit(l)
  ]);

  res.status(200).json({
    success: true,
    data: bookings,
    pagination: {
      page: p,
      limit: l,
      total,
      pages: Math.ceil(total / l)
    }
  });
});

/**
 * Admin: Create manual booking
 */
const createAdminBooking = asyncHandler(async (req, res) => {
  const { customer, event, package: packageId, dishes, equipmentItems, services, specialRequests, status = 'confirmed' } = req.body;

  if (!customer?.fullName || !customer?.phone || !event?.date || !event?.guestsCount) {
    throw new ApiError(400, 'Données obligatoires manquantes.');
  }

  const setting = await Setting.findOne() || { setupDaysBefore: 1, returnDaysAfter: 1 };
  const eventDate = toMidnight(event.date);
  const setupDays = setting.setupDaysBefore || 1;
  const returnDays = setting.returnDaysAfter || 1;
  const rentalFrom = new Date(eventDate.getTime() - setupDays * 24 * 60 * 60 * 1000);
  const rentalTo = new Date(eventDate.getTime() + returnDays * 24 * 60 * 60 * 1000);

  const pricingResult = await calculatePricing({
    packageId,
    guestsCount: Number(event.guestsCount),
    dishes,
    equipmentItems,
    services,
    city: event.city || 'Casablanca'
  });

  const eventYear = eventDate.getFullYear() || new Date().getFullYear();
  const trackingCode = await generateTrackingCode(eventYear);

  const booking = await Booking.create({
    trackingCode,
    kind: packageId ? 'booking' : 'custom_quote',
    status,
    source: 'admin',
    customer,
    event: {
      ...event,
      date: eventDate
    },
    rental: {
      from: rentalFrom,
      to: rentalTo
    },
    package: packageId || undefined,
    packageSnapshot: pricingResult.packageSnapshot,
    dishes: pricingResult.dishesDetail,
    equipmentItems: pricingResult.equipmentDetail,
    services: pricingResult.servicesDetail,
    specialRequests,
    pricing: pricingResult.breakdown,
    statusHistory: [{
      status,
      at: new Date(),
      by: req.user?._id,
      reason: 'Création manuelle par l’équipe'
    }]
  });

  res.status(201).json({
    success: true,
    message: 'Réservation créée avec succès.',
    data: booking
  });
});

/**
 * Admin: Get booking by ID
 */
const getAdminBookingById = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate('package')
    .populate('dishes.dish')
    .populate('equipmentItems.equipment')
    .populate('services.service')
    .populate('payments.recordedBy', 'fullName email')
    .populate('internalNotes.by', 'fullName email')
    .populate('statusHistory.by', 'fullName email');

  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  res.status(200).json({
    success: true,
    data: booking
  });
});

/**
 * Admin: Update booking details (recomputes price and revalidates stock)
 */
const updateAdminBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  const { event, package: packageId, dishes, equipmentItems, services, specialRequests, customer } = req.body;

  if (customer) Object.assign(booking.customer, customer);
  if (event) {
    if (event.date) {
      booking.event.date = toMidnight(event.date);
      const setting = await Setting.findOne() || { setupDaysBefore: 1, returnDaysAfter: 1 };
      booking.rental.from = new Date(booking.event.date.getTime() - setting.setupDaysBefore * 24 * 60 * 60 * 1000);
      booking.rental.to = new Date(booking.event.date.getTime() + setting.returnDaysAfter * 24 * 60 * 60 * 1000);
    }
    if (event.guestsCount) booking.event.guestsCount = Number(event.guestsCount);
    if (event.type) booking.event.type = event.type;
    if (event.city) booking.event.city = event.city;
    if (event.address !== undefined) booking.event.address = event.address;
    if (event.startTime) booking.event.startTime = event.startTime;
    if (event.endTime) booking.event.endTime = event.endTime;
  }

  if (specialRequests !== undefined) booking.specialRequests = specialRequests;

  // Re-calculate pricing
  const pricingResult = await calculatePricing({
    packageId: packageId !== undefined ? packageId : booking.package,
    guestsCount: booking.event.guestsCount,
    dishes: dishes || booking.dishes,
    equipmentItems: equipmentItems || booking.equipmentItems,
    services: services || booking.services,
    city: booking.event.city
  });

  if (packageId !== undefined) {
    booking.package = packageId || undefined;
    booking.packageSnapshot = pricingResult.packageSnapshot;
  }
  if (dishes) booking.dishes = pricingResult.dishesDetail;
  if (equipmentItems) booking.equipmentItems = pricingResult.equipmentDetail;
  if (services) booking.services = pricingResult.servicesDetail;
  booking.pricing = pricingResult.breakdown;

  booking.statusHistory.push({
    status: booking.status,
    at: new Date(),
    by: req.user?._id,
    reason: 'Modification des détails par l’administrateur'
  });

  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Réservation mise à jour avec succès.',
    data: booking
  });
});

/**
 * Admin: Change booking status with RG rules:
 * - RG9: Acompte requis pour confirmed
 * - RG11: Staff can do new -> quote_sent; confirmed/cancelled/rejected require admin
 * - RG14: Stock conflict checks before confirm
 */
const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status, reason, forceConflict = false } = req.body;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  const userRole = req.user?.role || 'staff';

  // RG11 check
  if (userRole === 'staff') {
    if (['confirmed', 'cancelled', 'rejected'].includes(status)) {
      throw new ApiError(403, 'Seul un administrateur peut confirmer, annuler ou rejeter une réservation.');
    }
  }

  // RG10 / Status check: motif obligatoire si annulation ou rejet
  if (['cancelled', 'rejected'].includes(status) && !reason) {
    throw new ApiError(400, 'Un motif est obligatoire pour annuler ou rejeter une réservation.');
  }

  // Check stock conflicts if moving to confirmed
  if (status === 'confirmed' && booking.status !== 'confirmed') {
    const from = booking.rental?.from || booking.event.date;
    const to = booking.rental?.to || booking.event.date;

    const stockValidation = await validateEquipmentRequest(
      booking.equipmentItems,
      from,
      to,
      booking._id
    );

    if (!stockValidation.isValid && !forceConflict) {
      return res.status(409).json({
        success: false,
        message: 'Conflit de matériel détecté sur cette période.',
        conflicts: stockValidation.conflicts,
        canForce: userRole === 'admin'
      });
    }

    if (stockValidation.conflicts.length > 0 && forceConflict && userRole === 'admin') {
      booking.internalNotes.push({
        text: `Validation forcée malgré conflit de matériel : ${reason || 'Location d’appoint prévue'}`,
        by: req.user?._id,
        at: new Date()
      });
    }
  }

  booking.status = status;
  booking.statusHistory.push({
    status,
    at: new Date(),
    by: req.user?._id,
    reason: reason || `Statut passé à ${status}`
  });

  if (status === 'quote_sent' && !booking.quoteSentAt) {
    booking.quoteSentAt = new Date();
    booking.quoteValidUntil = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  }

  await booking.save();

  res.status(200).json({
    success: true,
    message: `Statut mis à jour avec succès : ${status}.`,
    data: booking
  });
});

/**
 * Admin: Add payment (acompte / solde)
 */
const addPayment = asyncHandler(async (req, res) => {
  const { amount, method, note } = req.body;
  if (!amount || amount <= 0) {
    throw new ApiError(400, 'Le montant du paiement doit être supérieur à 0.');
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  const paymentObj = {
    amount: Number(amount),
    method: method || 'virement',
    paidAt: new Date(),
    note: note || '',
    recordedBy: req.user?._id
  };

  booking.payments.push(paymentObj);

  // If status is quote_sent and payment >= deposit, can auto mark as confirmed
  const totalPaid = booking.payments.reduce((acc, p) => acc + p.amount, 0);
  if (booking.status === 'quote_sent' && totalPaid >= (booking.pricing?.deposit || 0)) {
    booking.status = 'confirmed';
    booking.statusHistory.push({
      status: 'confirmed',
      at: new Date(),
      by: req.user?._id,
      reason: `Confirmation automatique suite à encaissement de l’acompte (${totalPaid} MAD).`
    });
  }

  await booking.save();

  res.status(201).json({
    success: true,
    message: 'Paiement enregistré avec succès.',
    data: booking
  });
});

/**
 * Admin: Remove payment
 */
const removePayment = asyncHandler(async (req, res) => {
  const { id, paymentId } = req.params;
  const booking = await Booking.findById(id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  booking.payments = booking.payments.filter((p) => p._id.toString() !== paymentId);
  await booking.save();

  res.status(200).json({
    success: true,
    message: 'Paiement supprimé.',
    data: booking
  });
});

/**
 * Admin: Add internal note
 */
const addInternalNote = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text) throw new ApiError(400, 'Texte de la note obligatoire.');

  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  booking.internalNotes.push({
    text,
    by: req.user?._id,
    at: new Date()
  });

  await booking.save();

  res.status(201).json({
    success: true,
    message: 'Note ajoutée.',
    data: booking.internalNotes
  });
});

/**
 * Admin & Public: Generate PDF stream
 */
const downloadBookingPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type = 'quote' } = req.query;

  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const booking = isObjectId
    ? await Booking.findById(id).populate('package')
    : await Booking.findOne({ trackingCode: id.toUpperCase() }).populate('package');

  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  const filename = `${type === 'invoice' ? 'Facture' : 'Devis'}_${booking.trackingCode}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

  await generateBookingPDF(booking, type, res);
});

/**
 * Admin: Send quote by email
 */
const sendQuoteEmail = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');
  if (!booking.customer.email) {
    throw new ApiError(400, 'Ce client n’a pas d’adresse email renseignée.');
  }

  await sendEmail({
    to: booking.customer.email,
    subject: `Votre devis officiel Elhabchi Traiteur - ${booking.trackingCode}`,
    text: `Bonjour ${booking.customer.fullName},\n\nVotre devis pour l'événement du ${new Date(booking.event.date).toLocaleDateString('fr-FR')} a été finalisé.\nMontant total : ${booking.pricing.total} MAD.\nAcompte requis : ${booking.pricing.deposit} MAD.\n\nVous pouvez le consulter et le valider sur : ${process.env.CLIENT_URL || 'http://localhost:5173'}/suivi?code=${booking.trackingCode}`
  });

  booking.quoteSentAt = new Date();
  if (booking.status === 'new') {
    booking.status = 'quote_sent';
    booking.statusHistory.push({
      status: 'quote_sent',
      at: new Date(),
      by: req.user?._id,
      reason: 'Envoi du devis par email'
    });
  }
  await booking.save();

  res.status(200).json({
    success: true,
    message: `Devis envoyé par email à ${booking.customer.email}.`
  });
});

/**
 * Admin: Get WhatsApp link with prepared message template
 */
const getWhatsAppReplyLink = asyncHandler(async (req, res) => {
  const { template = 'quote_ready' } = req.query;
  const booking = await Booking.findById(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  const link = buildAdminReplyUrl(booking, template);
  res.status(200).json({
    success: true,
    data: {
      url: link,
      customerPhone: booking.customer.phone
    }
  });
});

/**
 * Admin: Export bookings to CSV
 */
const exportBookingsCSV = asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ 'event.date': -1 });

  const headers = ['Code', 'Statut', 'Client', 'Téléphone', 'Email', 'Type', 'Date', 'Invités', 'Ville', 'Total (MAD)', 'Acompte (MAD)', 'Créé le'];
  const rows = bookings.map((b) => [
    b.trackingCode,
    b.status,
    `"${b.customer.fullName.replace(/"/g, '""')}"`,
    b.customer.phone,
    b.customer.email || '',
    b.event.type,
    new Date(b.event.date).toISOString().split('T')[0],
    b.event.guestsCount,
    b.event.city,
    b.pricing?.total || 0,
    b.pricing?.deposit || 0,
    b.createdAt.toISOString()
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="reservations-elhabchi.csv"');
  res.status(200).send('\uFEFF' + csv); // add UTF-8 BOM
});

/**
 * Admin: Delete booking
 */
const deleteBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) throw new ApiError(404, 'Réservation introuvable.');

  res.status(200).json({
    success: true,
    message: 'Réservation supprimée définitivement.'
  });
});

module.exports = {
  estimateBooking,
  createPublicBooking,
  recordWhatsAppClick,
  trackBooking,
  respondToBooking,
  submitContactMessage,
  getAdminBookings,
  createAdminBooking,
  getAdminBookingById,
  updateAdminBooking,
  updateBookingStatus,
  addPayment,
  removePayment,
  addInternalNote,
  downloadBookingPDF,
  sendQuoteEmail,
  getWhatsAppReplyLink,
  exportBookingsCSV,
  deleteBooking
};
