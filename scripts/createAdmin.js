import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User.js';

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/tuition-management');
    console.log('Connected to MongoDB');

    const adminExists = await User.findOne({ email: 'admin@tuitionhub.com' });
    if (adminExists) {
      console.log('Admin already exists! You can log in with admin@tuitionhub.com / admin123');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const admin = new User({
      name: 'System Admin',
      email: 'admin@tuitionhub.com',
      password: hashedPassword,
      role: 'admin'
    });

    await admin.save();
    console.log('Admin user created successfully!');
    console.log('Email: admin@tuitionhub.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
