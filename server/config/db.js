const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  try {
    if (process.env.MONGO_DNS_SERVERS) {
      dns.setServers(process.env.MONGO_DNS_SERVERS.split(',').map((server) => server.trim()));
    }
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/citizenhub');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[Warning]: If MongoDB is not running locally, start MongoDB or update MONGO_URI in .env with MongoDB Atlas.`);
  }
};

module.exports = connectDB;
