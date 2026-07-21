import User from '../models/User.js';
import Earning from '../models/Earning.js';
import WithdrawalRequest from '../models/WithdrawalRequest.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';
import Notification from '../models/Notification.js';

const MIN_WITHDRAWAL_AMOUNT = 500; // LKR — adjust as needed

// @desc    Get the logged-in teacher's wallet summary + recent earnings
// @route   GET /api/earnings/my
// @access  Private (Teacher)
export const getMyEarnings = async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers have an earnings wallet' });
    }

    const user = await User.findById(req.user._id).select('teacherDetails.wallet teacherDetails.payoutDetails');
    const earnings = await Earning.find({ teacher: req.user._id, teacherAmount: { $gt: 0 } })
      .populate('classId', 'title')
      .populate('student', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const withdrawals = await WithdrawalRequest.find({ teacher: req.user._id }).sort({ createdAt: -1 });

    res.json({
      wallet: user.teacherDetails?.wallet || { available: 0, pendingWithdrawal: 0, totalEarned: 0, totalWithdrawn: 0 },
      payoutDetails: user.teacherDetails?.payoutDetails || {},
      commissionRate: 0.10,
      minWithdrawalAmount: MIN_WITHDRAWAL_AMOUNT,
      recentEarnings: earnings,
      withdrawals
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save/update teacher's payout (bank) details
// @route   PUT /api/earnings/payout-details
// @access  Private (Teacher)
export const updatePayoutDetails = async (req, res) => {
  try {
    const { bankName, accountName, accountNumber, branch } = req.body;

    if (!bankName || !accountName || !accountNumber) {
      return res.status(400).json({ message: 'Bank name, account name, and account number are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can set payout details' });
    }

    user.teacherDetails.payoutDetails = { bankName, accountName, accountNumber, branch };
    await user.save();

    res.json({ message: 'Payout details saved', payoutDetails: user.teacherDetails.payoutDetails });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request a withdrawal of available wallet balance
// @route   POST /api/earnings/withdraw
// @access  Private (Teacher)
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount } = req.body;
    const requestedAmount = Number(amount);

    if (!requestedAmount || requestedAmount <= 0) {
      return res.status(400).json({ message: 'Enter a valid withdrawal amount' });
    }
    if (requestedAmount < MIN_WITHDRAWAL_AMOUNT) {
      return res.status(400).json({ message: `Minimum withdrawal amount is Rs. ${MIN_WITHDRAWAL_AMOUNT}` });
    }

    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'teacher') {
      return res.status(403).json({ message: 'Only teachers can request withdrawals' });
    }

    if (!user.teacherDetails?.payoutDetails?.accountNumber) {
      return res.status(400).json({ message: 'Please add your bank/payout details before requesting a withdrawal' });
    }

    const wallet = user.teacherDetails.wallet || { available: 0 };
    if (requestedAmount > wallet.available) {
      return res.status(400).json({ message: 'Requested amount exceeds your available balance' });
    }

    // Lock the funds: move from available -> pendingWithdrawal
    user.teacherDetails.wallet.available -= requestedAmount;
    user.teacherDetails.wallet.pendingWithdrawal = (user.teacherDetails.wallet.pendingWithdrawal || 0) + requestedAmount;
    await user.save();

    const withdrawal = await WithdrawalRequest.create({
      teacher: user._id,
      amount: requestedAmount,
      status: 'pending',
      payoutDetails: user.teacherDetails.payoutDetails
    });

    await notifyAdmins(
      `Teacher ${user.name} requested a withdrawal of Rs. ${requestedAmount}.`,
      'withdrawal_request',
      withdrawal._id
    );

    res.status(201).json(withdrawal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────

// @desc    Platform-wide earnings overview: totals, monthly trend, top teachers
// @route   GET /api/earnings/admin/overview
// @access  Private (Admin)
export const getAdminEarningsOverview = async (req, res) => {
  try {
    // ── Lifetime totals ──
    const totals = await Earning.aggregate([
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: '$grossAmount' },
          totalPlatformCommission: { $sum: '$commissionAmount' },
          totalTeacherEarnings: { $sum: '$teacherAmount' },
          totalTransactions: { $sum: 1 },
          registrationRevenue: {
            $sum: { $cond: [{ $eq: ['$commissionRate', 1] }, '$grossAmount', 0] }
          },
          classCommission: {
            $sum: { $cond: [{ $ne: ['$commissionRate', 1] }, '$commissionAmount', 0] }
          }
        }
      }
    ]);

    const summary = totals[0] || {
      totalGrossRevenue: 0,
      totalPlatformCommission: 0,
      totalTeacherEarnings: 0,
      totalTransactions: 0,
      registrationRevenue: 0,
      classCommission: 0
    };

    // ── Pending withdrawal liabilities ──
    const pendingWithdrawals = await WithdrawalRequest.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const pendingWithdrawalSummary = pendingWithdrawals[0] || { total: 0, count: 0 };

    // ── Monthly trend (last 12 distinct months present in data) ──
    const monthlyTrend = await Earning.aggregate([
      {
        $group: {
          _id: '$month',
          grossRevenue: { $sum: '$grossAmount' },
          platformCommission: { $sum: '$commissionAmount' },
          teacherEarnings: { $sum: '$teacherAmount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // ── Top earning teachers (all-time) ──
    const topTeachers = await Earning.aggregate([
      {
        $group: {
          _id: '$teacher',
          totalEarned: { $sum: '$teacherAmount' },
          totalCommissionGenerated: { $sum: '$commissionAmount' },
          transactions: { $sum: 1 }
        }
      },
      { $sort: { totalEarned: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'teacher'
        }
      },
      { $unwind: '$teacher' },
      {
        $project: {
          _id: 0,
          teacherId: '$teacher._id',
          name: '$teacher.name',
          email: '$teacher.email',
          totalEarned: 1,
          totalCommissionGenerated: 1,
          transactions: 1
        }
      }
    ]);

    res.json({
      summary,
      pendingWithdrawalSummary,
      monthlyTrend,
      topTeachers,
      commissionRate: 0.10
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all withdrawal requests (optionally filter by status)
// @route   GET /api/earnings/admin/withdrawals?status=pending
// @access  Private (Admin)
export const getAllWithdrawals = async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const withdrawals = await WithdrawalRequest.find(filter)
      .populate('teacher', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve and mark a withdrawal as paid
// @route   PATCH /api/earnings/admin/withdrawals/:id/pay
// @access  Private (Admin)
export const markWithdrawalPaid = async (req, res) => {
  try {
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${withdrawal.status}` });
    }

    const teacher = await User.findById(withdrawal.teacher);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    teacher.teacherDetails.wallet.pendingWithdrawal -= withdrawal.amount;
    teacher.teacherDetails.wallet.totalWithdrawn = (teacher.teacherDetails.wallet.totalWithdrawn || 0) + withdrawal.amount;
    await teacher.save();

    withdrawal.status = 'paid';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    await Notification.create({
      userId: teacher._id,
      message: `Your withdrawal of Rs. ${withdrawal.amount} has been paid out.`
    });

    res.json(withdrawal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a withdrawal request and return funds to available balance
// @route   PATCH /api/earnings/admin/withdrawals/:id/reject
// @access  Private (Admin)
export const rejectWithdrawal = async (req, res) => {
  try {
    const { adminNote } = req.body;
    const withdrawal = await WithdrawalRequest.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ message: 'Withdrawal request not found' });
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ message: `Request is already ${withdrawal.status}` });
    }

    const teacher = await User.findById(withdrawal.teacher);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });

    // Return the locked funds back to available balance
    teacher.teacherDetails.wallet.pendingWithdrawal -= withdrawal.amount;
    teacher.teacherDetails.wallet.available += withdrawal.amount;
    await teacher.save();

    withdrawal.status = 'rejected';
    withdrawal.adminNote = adminNote || '';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    await Notification.create({
      userId: teacher._id,
      message: `Your withdrawal request of Rs. ${withdrawal.amount} was rejected.${adminNote ? ' Reason: ' + adminNote : ''}`
    });

    res.json(withdrawal);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};