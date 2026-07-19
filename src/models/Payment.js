import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'LKR' },
    purpose: {
      type: String,
      enum: ['teacher_registration_fee', 'class_monthly_fee'],
      default: 'teacher_registration_fee'
    },
    // Only set when purpose === 'class_monthly_fee'
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    month: { type: String }, // format: 'YYYY-MM'
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending'
    },
    payherePaymentId: { type: String },
    payhereStatusCode: { type: String },
    method: { type: String },
    rawNotifyPayload: { type: mongoose.Schema.Types.Mixed }
  },
  { timestamps: true }
);

// Prevent duplicate payment records for the same student/class/month
paymentSchema.index(
  { user: 1, classId: 1, month: 1 },
  { unique: true, partialFilterExpression: { purpose: 'class_monthly_fee' } }
);

export default mongoose.model('Payment', paymentSchema);