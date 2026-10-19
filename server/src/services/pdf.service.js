const PDFDocument = require('pdfkit');
const Setting = require('../models/Setting');

function fmtMAD(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'MAD',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Generate PDF for Quote (Devis) or Invoice (Facture)
 * @param {Object} booking
 * @param {string} type 'quote' | 'invoice'
 * @param {Stream} writeStream
 */
async function generateBookingPDF(booking, type = 'quote', writeStream) {
  const setting = await Setting.findOne() || {
    businessName: 'Elhabchi Traiteur',
    phone: '+212 705 782 737',
    email: 'contact@elhabchitraiteur.ma',
    address: 'Boulevard d’Anfa, Casablanca, Maroc',
    cancellationPolicy: {
      fr: "Annulation gratuite jusqu'à 30 jours avant l'événement. Au-delà, l'acompte de 30% est conservé."
    }
  };

  const isInvoice = type === 'invoice';
  const docTitle = isInvoice ? 'FACTURE' : 'DEVIS ESTIMATIF';
  const docRef = isInvoice
    ? `FAC-${booking.trackingCode.replace('ELH-', '')}`
    : booking.trackingCode;

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  doc.pipe(writeStream);

  // Brand Colors
  const vertZellige = '#0F5C4D';
  const orSafran = '#B8923A';
  const anthracite = '#1F1B16';
  const grisClair = '#F2EFEB';

  // Header Banner
  doc.rect(40, 40, 515, 70).fill(vertZellige);

  doc.fillColor('#FFFFFF')
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('ELHABCHI TRAITEUR', 55, 52);

  doc.fontSize(10)
    .font('Helvetica')
    .text('Gastronomie Marocaine Haut de Gamme & Réceptions', 55, 78);

  doc.fillColor(orSafran)
    .fontSize(16)
    .font('Helvetica-Bold')
    .text(docTitle, 380, 56, { align: 'right', width: 160 });

  doc.fillColor('#FFFFFF')
    .fontSize(9)
    .font('Helvetica')
    .text(`Réf : ${docRef}`, 380, 78, { align: 'right', width: 160 });

  doc.moveDown(2);

  // Two columns: Company Info & Client/Event Info
  const startY = 125;
  doc.fillColor(anthracite).fontSize(10).font('Helvetica-Bold').text('Émetteur :', 45, startY);
  doc.font('Helvetica').fontSize(9)
    .text(setting.businessName || 'Elhabchi Traiteur', 45, startY + 15)
    .text(setting.address || 'Casablanca, Maroc', 45, startY + 28)
    .text(`Tél : ${setting.phone || '+212 705 782 737'}`, 45, startY + 41)
    .text(`Email : ${setting.email || 'contact@elhabchitraiteur.ma'}`, 45, startY + 54)
    .text('IF: 45892314 · RC: 562180 Casablanca', 45, startY + 67);

  doc.font('Helvetica-Bold').fontSize(10).text('Client & Événement :', 320, startY);
  doc.font('Helvetica').fontSize(9)
    .text(`Nom : ${booking.customer.fullName}`, 320, startY + 15)
    .text(`Téléphone : ${booking.customer.phone}`, 320, startY + 28)
    .text(`Type d'événement : ${booking.event.type}`, 320, startY + 41)
    .text(`Date : ${fmtDate(booking.event.date)} (${booking.event.startTime} - ${booking.event.endTime})`, 320, startY + 54)
    .text(`Invités : ${booking.event.guestsCount} personnes`, 320, startY + 67)
    .text(`Lieu : ${booking.event.city} ${booking.event.venueType ? `(${booking.event.venueType})` : ''}`, 320, startY + 80);

  // Table header
  let tableY = 225;
  doc.rect(40, tableY, 515, 22).fill(grisClair);
  doc.fillColor(vertZellige).font('Helvetica-Bold').fontSize(9);
  doc.text('DÉSIGNATION', 50, tableY + 6);
  doc.text('QTÉ', 310, tableY + 6, { width: 40, align: 'center' });
  doc.text('P.U (MAD)', 360, tableY + 6, { width: 70, align: 'right' });
  doc.text('TOTAL (MAD)', 440, tableY + 6, { width: 100, align: 'right' });

  tableY += 26;
  doc.fillColor(anthracite).font('Helvetica').fontSize(9);

  // Helper row drawer
  const drawRow = (label, qty, pu, total) => {
    if (tableY > 700) {
      doc.addPage();
      tableY = 50;
    }
    doc.text(label, 50, tableY, { width: 250 });
    doc.text(String(qty), 310, tableY, { width: 40, align: 'center' });
    doc.text(fmtMAD(pu), 360, tableY, { width: 70, align: 'right' });
    doc.text(fmtMAD(total), 440, tableY, { width: 100, align: 'right' });
    tableY += 20;
    doc.strokeColor('#EEEEEE').lineWidth(0.5).moveTo(45, tableY - 4).lineTo(545, tableY - 4).stroke();
  };

  // 1. Package
  if (booking.packageSnapshot?.name) {
    drawRow(
      `Formule : ${booking.packageSnapshot.name}`,
      booking.event.guestsCount,
      booking.packageSnapshot.pricePerPerson,
      booking.packageSnapshot.pricePerPerson * booking.event.guestsCount
    );
  }

  // 2. Extra Dishes
  if (booking.dishes && booking.dishes.length > 0) {
    for (const d of booking.dishes) {
      const q = d.pricingMode === 'per_person' ? booking.event.guestsCount : (d.quantity || 1);
      const rowTotal = d.unitPrice * q;
      drawRow(`Plat : ${d.name} (${d.pricingMode === 'per_person' ? 'par pers.' : 'unité'})`, q, d.unitPrice, rowTotal);
    }
  }

  // 3. Equipment
  if (booking.equipmentItems && booking.equipmentItems.length > 0) {
    for (const eq of booking.equipmentItems) {
      const days = eq.days || 1;
      const rowTotal = eq.unitPrice * eq.quantity * days;
      drawRow(`Matériel : ${eq.name} (${days}j)`, eq.quantity, eq.unitPrice, rowTotal);
    }
  }

  // 4. Services
  if (booking.services && booking.services.length > 0) {
    for (const s of booking.services) {
      const rowTotal = s.unitPrice * (s.quantity || 1);
      drawRow(`Prestation : ${s.name}`, s.quantity || 1, s.unitPrice, rowTotal);
    }
  }

  // 5. Delivery
  if (booking.pricing?.deliveryFee > 0) {
    drawRow(`Frais de déplacement et logistique (${booking.event.city})`, 1, booking.pricing.deliveryFee, booking.pricing.deliveryFee);
  }

  // Total summary box
  tableY += 10;
  const totalsX = 340;
  doc.rect(totalsX, tableY, 215, 110).fill(grisClair);
  doc.fillColor(anthracite).fontSize(9).font('Helvetica');

  doc.text('Sous-total :', totalsX + 15, tableY + 12);
  doc.text(fmtMAD(booking.pricing?.total || 0), totalsX + 110, tableY + 12, { width: 90, align: 'right' });

  doc.text('TVA (0% selon régime) :', totalsX + 15, tableY + 30);
  doc.text('0 MAD', totalsX + 110, tableY + 30, { width: 90, align: 'right' });

  doc.font('Helvetica-Bold').fillColor(vertZellige).fontSize(11);
  doc.text('TOTAL NET :', totalsX + 15, tableY + 52);
  doc.text(fmtMAD(booking.pricing?.total || 0), totalsX + 100, tableY + 52, { width: 100, align: 'right' });

  const deposit = booking.pricing?.deposit || Math.round((booking.pricing?.total || 0) * 0.3);
  doc.font('Helvetica').fillColor(anthracite).fontSize(9);
  doc.text(`Acompte requis (30%) :`, totalsX + 15, tableY + 76);
  doc.text(fmtMAD(deposit), totalsX + 110, tableY + 76, { width: 90, align: 'right' });

  // Payments registered
  const totalPaid = (booking.payments || []).reduce((acc, p) => acc + (p.amount || 0), 0);
  doc.text(`Déjà réglé :`, totalsX + 15, tableY + 92);
  doc.text(fmtMAD(totalPaid), totalsX + 110, tableY + 92, { width: 90, align: 'right' });

  // Terms and conditions
  const footerY = tableY + 130;
  doc.fontSize(8).fillColor('#666666').font('Helvetica');
  doc.text('Conditions de réservation & d’annulation :', 45, footerY);
  doc.text(setting.cancellationPolicy?.fr || 'Acompte de 30% requis à la confirmation. Solde payable avant ou le jour de l’événement.', 45, footerY + 12, { width: 500 });
  doc.text('Elhabchi Traiteur vous remercie de votre confiance pour vos moments d’exception.', 45, footerY + 32, { align: 'center', width: 500 });

  doc.end();
}

module.exports = { generateBookingPDF };
