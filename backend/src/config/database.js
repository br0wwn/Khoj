const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed!`);
    console.error(`Error: ${error.message}`);
    console.error('\nPossible fixes:');
    console.error('1. Check MongoDB Atlas Network Access - whitelist your IP');
    console.error('2. Verify database credentials are correct');
    console.error('3. Ensure MongoDB cluster is running');
    process.exit(1);
  }
};

module.exports = connectDB;
