require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');

const createTestAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('ℹ️  Admin already exists!');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create test admin
    const admin = await Admin.create({
      name: 'Test Admin',
      email: 'admin@test.com',
      phoneNumber: '1234567890',
      dateOfBirth: '1990-01-01',
      password: 'admin123',
      referredBy: 'System'
    });

    console.log('✅ Test admin created successfully!');
    console.log('\n📋 Admin Credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('\n🌐 Login at: http://localhost:3000/admin/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createTestAdmin();
