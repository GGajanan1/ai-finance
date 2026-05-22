const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('   Set MONGODB_URI in backend/.env');
    // Don't exit — allow the server to start so auth routes still 404 gracefully
  }
};

module.exports = connectDB;
