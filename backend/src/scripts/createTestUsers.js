/**
 * Script to create test users for the task management system
 * Run with: node src/scripts/createTestUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanagement');

    console.log('Connected to MongoDB');

    // Create admin user
    const adminEmail = 'admin@taskhub.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const admin = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin'
      });
      console.log('Admin user created:', admin.email);
    } else {
      console.log('Admin user already exists:', adminEmail);
    }

    // Create 50 test users
    const users = [];
    for (let i = 1; i <= 50; i++) {
      const email = `user${i}@taskhub.com`;
      const existingUser = await User.findOne({ email });
      
      if (!existingUser) {
        users.push({
          name: `Test User ${i}`,
          email: email,
          password: 'user123',
          role: 'user'
        });
      }
    }

    if (users.length > 0) {
      const createdUsers = await User.insertMany(users);
      console.log(`Created ${createdUsers.length} test users`);
    } else {
      console.log('All test users already exist');
    }

    // Display summary
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const userCount = await User.countDocuments({ role: 'user' });

    console.log('\n=== Summary ===');
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Admins: ${adminCount}`);
    console.log(`Regular Users: ${userCount}`);
    console.log('\nTest credentials:');
    console.log('Admin: admin@taskhub.com / admin123');
    console.log('Users: user1@taskhub.com to user50@taskhub.com / user123');

    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
};

createTestUsers();
