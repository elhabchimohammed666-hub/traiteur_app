const cron = require('node-cron');
const Booking = require('../models/Booking');
const Equipment = require('../models/Equipment');
const { sendEmail } = require('../services/notification.service');

function initCronJobs() {
  // Every day at 08:00 AM: Check event reminders (J-3 and J-1)
  cron.schedule('0 8 * * *', async () => {
    try {
      console.log('[Cron Job] Vérification des rappels d’événements...');
      const now = new Date();
      const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      const start1 = new Date(Date.UTC(in1Day.getUTCFullYear(), in1Day.getUTCMonth(), in1Day.getUTCDate()));
      const end1 = new Date(start1.getTime() + 24 * 60 * 60 * 1000);

      const bookingsJ1 = await Booking.find({
        'event.date': { $gte: start1, $lt: end1 },
        status: { $in: ['confirmed', 'in_progress'] }
      });

      for (const b of bookingsJ1) {
        if (b.customer.email) {
          sendEmail({
            to: b.customer.email,
            subject: `[J-1] Votre événement de demain avec Elhabchi Traiteur`,
            text: `Bonjour ${b.customer.fullName},\nNos équipes s’activent pour les préparatifs de votre événement de demain. Nous restons joignables au 0705782737.`
          }).catch(console.error);
        }
      }
    } catch (err) {
      console.error('[Cron Job Error - Reminders]', err.message);
    }
  });

  // Every day at 09:00 AM: Check stock alerts and email admin if low
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('[Cron Job] Vérification des alertes de stock...');
      const lowStockItems = await Equipment.find({
        isActive: true,
        $expr: { $lte: [{ $subtract: ['$totalQuantity', '$outOfServiceQuantity'] }, '$lowStockThreshold'] }
      });

      if (lowStockItems.length > 0) {
        console.log(`[Cron Job Alert] ${lowStockItems.length} article(s) sous le seuil d'alerte.`);
      }
    } catch (err) {
      console.error('[Cron Job Error - Stock]', err.message);
    }
  });

  console.log('[Cron Jobs] Tâches planifiées initialisées.');
}

module.exports = { initCronJobs };
