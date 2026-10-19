const env = require('../config/env');

function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function fmtMAD(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

/**
 * Builds the WhatsApp pre-filled message according to CDC specifications
 * Keeps content under 1500 chars.
 * @param {Object} b Booking object
 * @returns {string}
 */
function buildMessage(b) {
  const L = [];
  L.push('*Nouvelle demande - Elhabchi Traiteur*');
  L.push(`Réf : ${b.trackingCode}`);
  L.push('');
  L.push('*Client*');
  L.push(`Nom : ${b.customer?.fullName || ''}`);
  L.push(`Téléphone : ${b.customer?.phone || ''}`);
  L.push('');
  L.push('*Événement*');
  L.push(`Type : ${b.event?.type || 'Événement'}`);
  L.push(`Date : ${fmtDate(b.event?.date)} (${b.event?.startTime || '19:00'} - ${b.event?.endTime || '01:00'})`);
  L.push(`Invités : ${b.event?.guestsCount || 0}`);
  L.push(`Lieu : ${b.event?.city || 'Casablanca'}${b.event?.venueType ? ' (' + b.event.venueType + ')' : ''}`);
  L.push('');

  // Menu
  if (b.packageSnapshot?.name) {
    L.push('*Menu*');
    L.push(`Formule : ${b.packageSnapshot.name} (${fmtMAD(b.packageSnapshot.pricePerPerson)} / pers.)`);
  } else if (b.package?.name?.fr) {
    L.push('*Menu*');
    L.push(`Formule : ${b.package.name.fr} (${fmtMAD(b.package.pricePerPerson)} / pers.)`);
  }

  if (Array.isArray(b.dishes) && b.dishes.length > 0) {
    const dishNames = b.dishes.map((d) => d.name || 'Plat').slice(0, 5);
    L.push(`Plats : ${dishNames.join(', ')}${b.dishes.length > 5 ? '...' : ''}`);
  }

  // Equipment & Services
  const eqList = (b.equipmentItems || []).slice(0, 4).map((eq) => `- ${eq.name} x ${eq.quantity}`);
  const srvList = (b.services || []).slice(0, 3).map((s) => `- ${s.name}`);

  if (eqList.length > 0 || srvList.length > 0) {
    L.push('');
    L.push('*Matériel et services*');
    eqList.forEach((e) => L.push(e));
    if ((b.equipmentItems || []).length > 4) L.push(`... (+${b.equipmentItems.length - 4} articles)`);
    srvList.forEach((s) => L.push(s));
  }

  L.push('');
  const total = b.pricing?.total || 0;
  L.push(`*Estimation : ${fmtMAD(total)}* (devis définitif à confirmer)`);

  const clientBase = env.CLIENT_URL.replace(/\/$/, '');
  L.push(`Suivi : ${clientBase}/suivi?code=${b.trackingCode}`);

  if (b.specialRequests) {
    const cleanNote = b.specialRequests.trim().slice(0, 100);
    L.push(`Remarques : ${cleanNote}`);
  }

  let fullMsg = L.join('\n');
  if (fullMsg.length > 1500) {
    // Truncate cleanly if needed
    fullMsg = fullMsg.slice(0, 1450) + `\n... Détails complets : ${clientBase}/suivi?code=${b.trackingCode}`;
  }

  return fullMsg;
}

/**
 * Generates the wa.me URL
 * @param {Object} booking
 * @returns {string}
 */
function buildWhatsAppUrl(booking) {
  const number = env.WHATSAPP_NUMBER || '212705782737';
  const cleanNumber = number.replace(/[^0-9]/g, '');
  const message = buildMessage(booking);
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds direct message from Admin to Client
 * @param {Object} booking
 * @param {string} template ('quote_ready', 'confirmed', 'reminder')
 * @returns {string} wa.me URL
 */
function buildAdminReplyUrl(booking, template = 'quote_ready') {
  const clientPhone = (booking.customer?.phone || '').replace(/[^0-9]/g, '');
  // Format moroccan phone to international if starts with 0
  let intlPhone = clientPhone;
  if (intlPhone.startsWith('0')) {
    intlPhone = '212' + intlPhone.slice(1);
  } else if (!intlPhone.startsWith('212') && intlPhone.length === 9) {
    intlPhone = '212' + intlPhone;
  }

  let text = '';
  const clientBase = env.CLIENT_URL.replace(/\/$/, '');
  const trackLink = `${clientBase}/suivi?code=${booking.trackingCode}`;

  if (template === 'quote_ready') {
    text = `Bonjour ${booking.customer.fullName},\n\nVotre devis personnalisé pour votre événement du ${fmtDate(booking.event.date)} chez Elhabchi Traiteur est prêt !\n\nVous pouvez le consulter et le valider ici : ${trackLink}\n\nRestant à votre entière disposition,\nL'équipe Elhabchi Traiteur.`;
  } else if (template === 'confirmed') {
    text = `Bonjour ${booking.customer.fullName},\n\nNous vous confirmons avec plaisir la réservation de votre événement du ${fmtDate(booking.event.date)} (Réf : ${booking.trackingCode}).\n\nNos équipes préparent votre réception avec le plus grand soin.\nConsultez les détails : ${trackLink}\n\nBien cordialement,\nElhabchi Traiteur.`;
  } else if (template === 'reminder') {
    text = `Bonjour ${booking.customer.fullName},\n\nRappel : votre événement avec Elhabchi Traiteur aura lieu très prochainement le ${fmtDate(booking.event.date)}.\nNotre équipe logistique est mobilisée pour assurer une prestation parfaite.\n\nÀ très vite !`;
  } else {
    text = `Bonjour ${booking.customer.fullName},\nConcernant votre demande ${booking.trackingCode} chez Elhabchi Traiteur...`;
  }

  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`;
}

module.exports = {
  buildMessage,
  buildWhatsAppUrl,
  buildAdminReplyUrl,
  fmtMAD,
  fmtDate
};
