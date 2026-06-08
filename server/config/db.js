const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connURI = process.env.MONGODB_URI || 'mongodb://root:password123@localhost:27017/police_theft_db?authSource=admin';
    
    console.log('Connecting to database...');
    const conn = await mongoose.connect(connURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
