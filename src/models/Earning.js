import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    month: { type: String, required: true }, // 'YYYY-MM'
    grossAmount: { type: Number, required: true },      // full fee paid by student
    commissionRate: { type: Number, required: true },    // e.g. 0.10
    commissionAmount: { type: Number, required: true },  // site's cut
    teacherAmount: { type: Number, required: true }       // what's credited to teacher wallet
  },
  { timestamps: true }
);

export default mongoose.model('Earning', earningSchema);