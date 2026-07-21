import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkUsers = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const teachers = await User.find({ role: 'teacher' }).sort({ createdAt: -1 }).limit(5);
  console.log(teachers.map(t => ({ name: t.name, profilePicture: t.profilePicture, status: t.status })));
  process.exit(0);
};

checkUsers();
