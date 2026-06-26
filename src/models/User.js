import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
  phone: { type: String },
  profilePicture: { type: String, default: '' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationOTP: { type: String },
  otpExpires: { type: Date },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  teacherDetails: {
    nic: { type: String },
    qualifications: { type: String },
    experience: { type: String },
    subjects: { type: String },
    mediums: [{ type: String }],
    grades: [{ type: String }]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
