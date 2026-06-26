import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  reservationDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
