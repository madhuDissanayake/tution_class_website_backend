import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tuition-management');
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = 'password123';
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // 1. Seed Teacher
    const teacherEmail = 'teacher@gmail.com';
    const existingTeacher = await User.findOne({ email: teacherEmail });
    if (!existingTeacher) {
      await User.create({
        name: 'Kamal Perera',
        email: teacherEmail,
        password: hashedPassword,
        role: 'teacher',
        status: 'approved',
        isEmailVerified: true,
        phone: '0711234567',
        teacherDetails: {
          nic: '851234567V',
          qualifications: 'BSc. Mathematics',
          experience: '5 Years',
          subjects: 'Mathematics',
          mediums: ['Sinhala', 'English'],
          grades: ['Grade 10', 'Grade 11', 'A/L']
        }
      });
      console.log(`Teacher user created! Email: ${teacherEmail}, Password: ${defaultPassword}`);
    } else {
      console.log('Teacher user already exists');
    }

    // 2. Seed Student
    const studentEmail = 'student@gmail.com';
    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      await User.create({
        name: 'Nimal Silva',
        email: studentEmail,
        password: hashedPassword,
        role: 'student',
        status: 'approved', // students are automatically approved
        isEmailVerified: true,
        phone: '0777654321'
      });
      console.log(`Student user created! Email: ${studentEmail}, Password: ${defaultPassword}`);
    } else {
      console.log('Student user already exists');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
