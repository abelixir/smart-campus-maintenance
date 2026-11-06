require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@campuscare.com';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    const admin = await User.create({
      name: 'System Admin',
      email: adminEmail,
      password: 'Admin@123456',
      role: 'admin',
    });

    console.log('Admin created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Admin@123456');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();