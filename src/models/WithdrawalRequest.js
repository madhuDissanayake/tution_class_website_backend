import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending'
    },
    payoutDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      branch: String
    },
    adminNote: { type: String },
    processedAt: { type: Date },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('WithdrawalRequest', withdrawalRequestSchema);