const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import the User model
const User = require('../models/User').default;

async function createAdminUser() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ez';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@ez.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'admin@ez.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    await adminUser.save();
    console.log('Admin user created successfully');
    console.log('Email: admin@ez.com');
    console.log('Password: admin123');
    console.log('Please change the password after first login!');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdminUser(); 