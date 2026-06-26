import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Class from './src/models/Class.js';
import User from './src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const clearDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Delete all classes
    const classResult = await Class.deleteMany({});
    console.log(`Deleted ${classResult.deletedCount} classes.`);

    // Delete all teachers
    const teacherResult = await User.deleteMany({ role: 'teacher' });
    console.log(`Deleted ${teacherResult.deletedCount} teachers.`);

    console.log('Cleanup complete.');
    process.exit(0);
  } catch (error) {
    console.error('Error clearing DB:', error);
    process.exit(1);
  }
};

clearDB();
