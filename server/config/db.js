const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/citizenhub');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    console.warn(`[Warning]: If MongoDB is not running locally, start MongoDB or update MONGO_URI in .env with MongoDB Atlas.`);
  }
};

module.exports = connectDB;
