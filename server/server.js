const path = require('path');
const dotenv = require('dotenv');
const connectDB = async () => {
  const dbConnect = require('./config/db');
  await dbConnect();
};

const startServer = async () => {
  // Load environment variables relative to this file's folder
  dotenv.config({ path: path.join(__dirname, '.env') });

  // Connect to Database
  await connectDB();

  const app = require('./app');
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start the server:', err);
});
