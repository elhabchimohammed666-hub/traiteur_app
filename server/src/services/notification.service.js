const nodemailer = require('nodemailer');
const env = require('../config/env');

let transporter = null;
if (env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
}

/**
 * Send an email notification safely
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) return;
  console.log(`[Notification Service] Envoi d'email à ${to}: "${subject}"`);

  if (!transporter) {
    console.log(`[Notification Service - Mode Dev] Email simulé pour ${to} :`);
    console.log(`Objet : ${subject}`);
    console.log(`Contenu : ${text || html}`);
    return { mocked: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Elhabchi Traiteur" <${env.SMTP_USER || 'contact@elhabchitraiteur.ma'}>`,
      to,
      subject,
      text,
      html
    });
    return info;
  } catch (err) {
    console.error(`[Notification Service] Erreur lors de l'envoi de l'email :`, err.message);
  }
}

/**
 * Notify admin of a new booking request
 */
async function notifyAdminNewBooking(booking) {
  const subject = `[Elhabchi Traiteur] Nouvelle demande : ${booking.trackingCode} (${booking.event.type})`;
  const text = `Une nouvelle demande a été reçue !\nRéf : ${booking.trackingCode}\nClient : ${booking.customer.fullName} (${booking.customer.phone})\nDate : ${new Date(booking.event.date).toLocaleDateString('fr-FR')}\nInvités : ${booking.event.guestsCount}\nTotal estimé : ${booking.pricing.total} MAD.`;
  await sendEmail({
    to: 'contact@elhabchitraiteur.ma',
    subject,
    text
  });
}

/**
 * Notify client of recorded request
 */
async function notifyClientBookingReceived(booking) {
  if (!booking.customer.email) return;
  const subject = `Votre demande de devis Elhabchi Traiteur (${booking.trackingCode})`;
  const text = `Bonjour ${booking.customer.fullName},\n\nNous avons bien reçu votre demande de devis pour votre événement prévu le ${new Date(booking.event.date).toLocaleDateString('fr-FR')}.\nVotre code de suivi est : ${booking.trackingCode}.\n\nVous pouvez suivre l'avancement de votre devis à tout moment sur : ${env.CLIENT_URL}/suivi?code=${booking.trackingCode}\n\nMerci de votre confiance,\nL'équipe Elhabchi Traiteur`;
  await sendEmail({
    to: booking.customer.email,
    subject,
    text
  });
}

module.exports = {
  sendEmail,
  notifyAdminNewBooking,
  notifyClientBookingReceived
};
