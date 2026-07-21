import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payment from './src/models/Payment.js';
import Earning from './src/models/Earning.js';

dotenv.config();

const backfillEarnings = async () => {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const pastPayments = await Payment.find({ purpose: 'teacher_registration_fee', status: 'completed' });
    console.log(`Found ${pastPayments.length} completed teacher registration payments.`);

    let added = 0;
    for (const payment of pastPayments) {
      const alreadyRecorded = await Earning.findOne({ payment: payment._id });
      if (!alreadyRecorded) {
        const d = new Date(payment.createdAt || Date.now());
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        await Earning.create({
          teacher: payment.user,
          payment: payment._id,
          month: monthStr,
          grossAmount: payment.amount,
          commissionRate: 1, // 100% platform fee
          commissionAmount: payment.amount,
          teacherAmount: 0
        });
        added++;
        console.log(`Added Earning for Payment ${payment.orderId}`);
      }
    }
    console.log(`Backfill complete. Added ${added} earnings.`);
    process.exit(0);
  } catch (error) {
    console.error('Error during backfill:', error);
    process.exit(1);
  }
};

backfillEarnings();
