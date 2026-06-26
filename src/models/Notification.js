import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  type: { type: String, enum: ['info', 'reservation_request', 'message', 'registration_request'], default: 'info' },
  relatedId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  subjectUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
