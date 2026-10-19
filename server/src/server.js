const app = require('./app');
const connectDB = require('./config/db');
const env = require('./config/env');
const { initCronJobs } = require('./jobs/index');

const startServer = async () => {
  await connectDB();

  // Start cron jobs
  initCronJobs();

  const server = app.listen(env.PORT, () => {
    console.log(`[Elhabchi Server] API lancée sur le port ${env.PORT} (${env.NODE_ENV})`);
    console.log(`[Elhabchi Server] URL API : http://localhost:${env.PORT}/api/v1`);
    console.log(`[Elhabchi Server] WhatsApp officiel : +${env.WHATSAPP_NUMBER}`);
  });

  process.on('unhandledRejection', (err) => {
    console.error('[UNHANDLED REJECTION]', err.message);
  });

  process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]', err.message);
  });
};

startServer();
