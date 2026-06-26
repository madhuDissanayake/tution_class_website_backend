import mongoose from 'mongoose';

const featuredTutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  studentsCount: {
    type: String,
    required: true,
  },
  themeColor: {
    type: String,
    required: true,
    enum: ['indigo', 'pink', 'emerald', 'blue', 'purple', 'rose', 'teal', 'cyan'],
    default: 'indigo',
  }
}, { timestamps: true });

export default mongoose.model('FeaturedTutor', featuredTutorSchema);
