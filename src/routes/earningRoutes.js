import express from 'express';
import {
  getMyEarnings,
  updatePayoutDetails,
  requestWithdrawal,
  getAdminEarningsOverview,
  getAllWithdrawals,
  markWithdrawalPaid,
  rejectWithdrawal
} from '../controllers/earningController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Teacher
router.get('/my', protect, getMyEarnings);
router.put('/payout-details', protect, updatePayoutDetails);
router.post('/withdraw', protect, requestWithdrawal);

// Admin
router.get('/admin/overview', protect, admin, getAdminEarningsOverview);
router.get('/admin/withdrawals', protect, admin, getAllWithdrawals);
router.patch('/admin/withdrawals/:id/pay', protect, admin, markWithdrawalPaid);
router.patch('/admin/withdrawals/:id/reject', protect, admin, rejectWithdrawal);

export default router;