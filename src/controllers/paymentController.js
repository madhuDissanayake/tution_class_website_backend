import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';
import Earning from '../models/Earning.js';
import {
  formatAmount,
  generateCheckoutHash,
  verifyNotifyHash,
  generateOrderId
} from '../utils/payhere.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';

const TEACHER_REGISTRATION_FEE = 1000; // LKR
const CURRENCY = 'LKR';
const PLATFORM_COMMISSION_RATE = 0.10; // 10%

const {
  PAYHERE_MERCHANT_ID,
  PAYHERE_MERCHANT_SECRET,
  PAYHERE_MODE, // 'sandbox' | 'live'
  APP_URL,      // e.g. https://api.tuitionhub.com
  CLIENT_URL    // e.g. https://tuitionhub.com
} = process.env;

const currentMonth = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const buildCheckoutPayload = ({ orderId, amount, items, user, returnPath, cancelPath }) => {
  const hash = generateCheckoutHash({
    merchantId: PAYHERE_MERCHANT_ID,
    orderId,
    amount,
    currency: CURRENCY,
    merchantSecret: PAYHERE_MERCHANT_SECRET
  });

  const [firstName, ...rest] = user.name.split(' ');
  const lastName = rest.join(' ') || firstName;

  return {
    sandbox: PAYHERE_MODE !== 'live',
    merchant_id: PAYHERE_MERCHANT_ID,
    return_url: `${CLIENT_URL}${returnPath}`,
    cancel_url: `${CLIENT_URL}${cancelPath}`,
    notify_url: `${APP_URL}/api/payment/notify`,
    order_id: orderId,
    items,
    amount,
    currency: CURRENCY,
    first_name: firstName,
    last_name: lastName,
    email: user.email,
    phone: user.phone || '0770000000',
    address: 'N/A',
    city: 'N/A',
    country: 'Sri Lanka',
    hash
  };
};

// ─────────────────────────────────────────────────────────
// TEACHER REGISTRATION FEE
// ─────────────────────────────────────────────────────────

// @desc    Initiate PayHere checkout for teacher registration fee
// @route   POST /api/payment/teacher/initiate
// @access  Private
export const initiateTeacherPayment = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'teacher') {
      return res.status(400).json({ message: 'Only teacher accounts require this payment' });
    }
    if (user.teacherDetails?.paymentStatus === 'completed') {
      return res.status(400).json({ message: 'Registration fee already paid' });
    }

    const orderId = generateOrderId('TCH');
    const amount = formatAmount(TEACHER_REGISTRATION_FEE);

    const payment = await Payment.create({
      user: user._id,
      orderId,
      amount: TEACHER_REGISTRATION_FEE,
      currency: CURRENCY,
      purpose: 'teacher_registration_fee',
      status: 'pending'
    });

    const payload = buildCheckoutPayload({
      orderId,
      amount,
      items: 'Teacher Registration Fee',
      user,
      returnPath: '/payment/success',
      cancelPath: '/payment/cancel'
    });

    return res.status(200).json({ ...payload, paymentRecordId: payment._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check current payment status for the logged-in teacher
// @route   GET /api/payment/teacher/status
// @access  Private
export const getTeacherPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      user: req.user._id,
      purpose: 'teacher_registration_fee'
    }).sort({ createdAt: -1 });

    if (!payment) return res.status(404).json({ message: 'No payment record found' });

    res.json({
      status: payment.status,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// CLASS MONTHLY FEE (student pays for a confirmed seat)
// ─────────────────────────────────────────────────────────

// @desc    Initiate PayHere checkout for a class's monthly fee
// @route   POST /api/payment/class/:classId/initiate
// @access  Private (Student)
export const initiateClassPayment = async (req, res) => {
  try {
    const { classId } = req.params;
    const month = req.body?.month || currentMonth();

    const student = await User.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'User not found' });

    const targetClass = await Class.findById(classId);
    if (!targetClass) return res.status(404).json({ message: 'Class not found' });

    const reservation = await Reservation.findOne({
      classId,
      studentId: student._id,
      status: 'confirmed'
    });
    if (!reservation) {
      return res.status(403).json({ message: 'You must have a confirmed seat in this class before paying' });
    }

    const existing = await Payment.findOne({
      user: student._id,
      classId,
      month,
      purpose: 'class_monthly_fee',
      status: 'completed'
    });
    if (existing) {
      return res.status(400).json({ message: `Fee for ${month} has already been paid for this class` });
    }

    const orderId = generateOrderId('CLS');
    const amount = formatAmount(targetClass.fee);

    const payment = await Payment.create({
      user: student._id,
      orderId,
      amount: targetClass.fee,
      currency: CURRENCY,
      purpose: 'class_monthly_fee',
      classId,
      month,
      status: 'pending'
    });

    const payload = buildCheckoutPayload({
      orderId,
      amount,
      items: `${targetClass.title} - ${month} Fee`,
      user: student,
      returnPath: '/payment/success',
      cancelPath: '/payment/cancel'
    });

    return res.status(200).json({ ...payload, paymentRecordId: payment._id });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A payment for this class and month already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check payment status for a specific class + month
// @route   GET /api/payment/class/:classId/status?month=YYYY-MM
// @access  Private (Student)
export const getClassPaymentStatus = async (req, res) => {
  try {
    const { classId } = req.params;
    const month = req.query.month || currentMonth();

    const payment = await Payment.findOne({
      user: req.user._id,
      classId,
      month,
      purpose: 'class_monthly_fee'
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.json({ status: 'unpaid', month });
    }

    res.json({
      status: payment.status,
      orderId: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      month
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all monthly payment history for a class (teacher/admin view)
// @route   GET /api/payment/class/:classId/history
// @access  Private (Teacher who owns the class, or Admin)
export const getClassPaymentHistory = async (req, res) => {
  try {
    const { classId } = req.params;

    const targetClass = await Class.findById(classId);
    if (!targetClass) return res.status(404).json({ message: 'Class not found' });

    if (req.user.role !== 'admin' && targetClass.teacherId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to view this class's payment history" });
    }

    const payments = await Payment.find({ classId, purpose: 'class_monthly_fee' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────
// SHARED PAYHERE NOTIFY WEBHOOK
// ─────────────────────────────────────────────────────────

// @desc    PayHere server-to-server notify webhook (handles both purposes)
// @route   POST /api/payment/notify
// @access  Public (verified via hash, not auth token)
export const payhereNotify = async (req, res) => {

  console.log(req)
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('PayHere notify: empty req.body — check express.urlencoded() is registered before routes');
      return res.status(400).send('Empty payload');
    }

    //console.log("7777777777777777777777777777" )

    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
      method
    } = req.body;

    const isValid = verifyNotifyHash({
      merchantId: merchant_id,
      orderId: order_id,
      payhereAmount: payhere_amount,
      payhereCurrency: payhere_currency,
      statusCode: status_code,
      merchantSecret: PAYHERE_MERCHANT_SECRET,
      md5sig
    });

    if (!isValid) {
      console.error('PayHere notify: hash mismatch for order', order_id);
      return res.status(400).send('Invalid signature');
    }

    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      console.error('PayHere notify: no payment found for order', order_id);
      return res.status(404).send('Payment not found');
    }

    payment.payherePaymentId = payment_id;
    payment.payhereStatusCode = status_code;
    payment.method = method;
    payment.rawNotifyPayload = req.body;

    //console.log("11111111111111111111111111" )
    //console.log("payment",payment)


    if (status_code === '2') {
      payment.status = 'completed';
      await payment.save();

      console.log("payment",payment)

      if (payment.purpose === 'teacher_registration_fee') {
        await handleTeacherRegistrationSuccess(payment);
      } else if (payment.purpose === 'class_monthly_fee') {
        await handleClassPaymentSuccess(payment);
      }
    } else if (status_code === '-1') {
      payment.status = 'cancelled';
      await payment.save();
    } else if (status_code === '-2' || status_code === '-3') {
      payment.status = 'failed';
      await payment.save();
    } else {
      payment.status = 'pending';
      await payment.save();
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('PayHere notify error:', error.message);
    return res.status(500).send('Server error');
  }
};

// ── FIXED: mutate specific nested fields instead of replacing the whole
// teacherDetails subdocument. Spreading a Mongoose subdocument only copies
// its *own* enumerable props, not schema-backed nested objects like
// wallet/payoutDetails — so the old code was overwriting those with
// `undefined` and Mongoose's cast validation was throwing on save.
const handleTeacherRegistrationSuccess = async (payment) => {
  const user = await User.findById(payment.user);
  if (!user) return;

  if (!user.teacherDetails) {
    user.teacherDetails = {};
  }

  user.teacherDetails.paymentStatus = 'completed';
  user.teacherDetails.paymentDate = new Date();

  await user.save();

  // Record the registration fee as a platform earning (100% commission)
  const alreadyRecorded = await Earning.findOne({ payment: payment._id });
  if (!alreadyRecorded) {
    const d = new Date();
    const currentMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    await Earning.create({
      teacher: user._id,
      payment: payment._id,
      month: currentMonthStr,
      grossAmount: payment.amount,
      commissionRate: 1, // 100% platform fee
      commissionAmount: payment.amount,
      teacherAmount: 0
    });
  }

  await notifyAdmins(
    `Teacher ${user.name} paid the registration fee. Ready for review.`,
    'registration_request',
    user._id,
    { teacher: user }
  );
};

// Splits the class payment 90/10 (teacher/platform) and credits the teacher's wallet
const handleClassPaymentSuccess = async (payment) => {
  const student = await User.findById(payment.user);
  const targetClass = await Class.findById(payment.classId);
  if (!student || !targetClass) return;

  const teacher = await User.findById(targetClass.teacherId);
  if (!teacher) return;

  const grossAmount = payment.amount;
  const commissionAmount = Math.round(grossAmount * PLATFORM_COMMISSION_RATE * 100) / 100;
  const teacherAmount = Math.round((grossAmount - commissionAmount) * 100) / 100;

  // Prevent double-crediting if PayHere ever resends the same notify
  const alreadyRecorded = await Earning.findOne({ payment: payment._id });
  if (!alreadyRecorded) {
    await Earning.create({
      teacher: teacher._id,
      payment: payment._id,
      classId: targetClass._id,
      student: student._id,
      month: payment.month,
      grossAmount,
      commissionRate: PLATFORM_COMMISSION_RATE,
      commissionAmount,
      teacherAmount
    });

    teacher.teacherDetails.wallet = teacher.teacherDetails.wallet || {
      available: 0,
      pendingWithdrawal: 0,
      totalEarned: 0,
      totalWithdrawn: 0
    };
    teacher.teacherDetails.wallet.available += teacherAmount;
    teacher.teacherDetails.wallet.totalEarned += teacherAmount;
    await teacher.save();
  }

  await Notification.create({
    userId: student._id,
    message: `Your ${payment.month} fee payment for "${targetClass.title}" was received.`
  });

  await Notification.create({
    userId: teacher._id,
    message: `${student.name} paid the ${payment.month} fee for "${targetClass.title}". Rs. ${teacherAmount} credited to your wallet (after 10% platform fee).`,
    type: 'info'
  });
};