const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGO_URI, {
      autoIndex: true
    });
    console.log(`[MongoDB] Connecté avec succès : ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Erreur de connexion :`, error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
