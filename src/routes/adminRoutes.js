import express from 'express';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Reservation from '../models/Reservation.js';
import FeaturedTutor from '../models/FeaturedTutor.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';
import { getAccountApprovedEmail, getAccountRejectedEmail } from '../utils/emailTemplates.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @desc    Get admin stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
router.get('/stats', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalClasses = await Class.countDocuments();
    const totalReservations = await Reservation.countDocuments();

    res.json({
      totalUsers,
      totalClasses,
      totalReservations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// USER APPROVAL MANAGEMENT
// ==========================================

// @desc    Get all pending users (students and teachers)
// @route   GET /api/admin/pending-users
// @access  Private (Admin)
router.get('/pending-users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({ status: 'pending', role: { $ne: 'admin' } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all pending seat reservations
// @route   GET /api/admin/pending-reservations
// @access  Private (Admin)
router.get('/pending-reservations', protect, admin, async (req, res) => {
  try {
    const reservations = await Reservation.find({ status: 'pending' })
      .populate('studentId', 'name email phone')
      .populate({
        path: 'classId',
        select: 'title subject medium grade fee teacherId',
        populate: { path: 'teacherId', select: 'name email' }
      })
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all approved teachers (for creating classes)
// @route   GET /api/admin/approved-teachers
// @access  Private (Admin)
router.get('/approved-teachers', protect, admin, async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher', status: 'approved' }).select('-password');
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve a user
// @route   PUT /api/admin/approve-user/:id
// @access  Private (Admin)
router.put('/approve-user/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.status = 'approved';
    await user.save();

    // Mark registration notification as read
    await Notification.updateMany(
      { subjectUserId: user._id, type: 'registration_request' },
      { $set: { isRead: true } }
    );

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'TuitionHub - Account Approved!',
      html: getAccountApprovedEmail(user.name)
    });

    // Send dashboard notification to the user
    await Notification.create({
      userId: user._id,
      message: 'Your account has been officially approved by the Administration.',
      type: 'info'
    });

    res.json({ message: 'User approved successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reject a user
// @route   PUT /api/admin/reject-user/:id
// @access  Private (Admin)
router.put('/reject-user/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.status = 'rejected';
    await user.save();

    // Mark registration notification as read
    await Notification.updateMany(
      { subjectUserId: user._id, type: 'registration_request' },
      { $set: { isRead: true } }
    );

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'TuitionHub - Account Update',
      html: getAccountRejectedEmail(user.name)
    });

    // Send dashboard notification to the user
    await Notification.create({
      userId: user._id,
      message: 'Your account registration was rejected by the Administration.',
      type: 'info'
    });

    res.json({ message: 'User rejected successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// FEATURED TUTORS MANAGEMENT
// ==========================================

// @desc    Get all featured tutors (Public)
// @route   GET /api/admin/featured-tutors/public
// @access  Public
router.get('/featured-tutors/public', async (req, res) => {
  try {
    const tutors = await FeaturedTutor.find({}).sort({ createdAt: -1 });
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all featured tutors (Admin)
// @route   GET /api/admin/featured-tutors
// @access  Private (Admin)
router.get('/featured-tutors', protect, admin, async (req, res) => {
  try {
    const tutors = await FeaturedTutor.find({}).sort({ createdAt: -1 });
    res.json(tutors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create featured tutor
// @route   POST /api/admin/featured-tutors
// @access  Private (Admin)
router.post('/featured-tutors', protect, admin, async (req, res) => {
  try {
    const tutor = new FeaturedTutor(req.body);
    const createdTutor = await tutor.save();
    res.status(201).json(createdTutor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @desc    Delete featured tutor
// @route   DELETE /api/admin/featured-tutors/:id
// @access  Private (Admin)
router.delete('/featured-tutors/:id', protect, admin, async (req, res) => {
  try {
    const tutor = await FeaturedTutor.findById(req.params.id);
    if (!tutor) {
      return res.status(404).json({ message: 'Tutor not found' });
    }
    await FeaturedTutor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tutor removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle class popular status
// @route   PUT /api/admin/classes/:id/toggle-popular
// @access  Private (Admin)
router.put('/classes/:id/toggle-popular', protect, admin, async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }
    classData.isPopular = !classData.isPopular;
    await classData.save();
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==========================================
// PENDING CLASS APPROVALS
// ==========================================

// @desc    Get all pending classes (submitted by teachers)
// @route   GET /api/admin/pending-classes
// @access  Private (Admin)
router.get('/pending-classes', protect, admin, async (req, res) => {
  try {
    const classes = await Class.find({ status: 'pending' })
      .populate('teacherId', 'name email phone profilePicture')
      .sort({ createdAt: -1 });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Approve a pending class → publish it
// @route   PUT /api/admin/classes/:id/approve
// @access  Private (Admin)
router.put('/classes/:id/approve', protect, admin, async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id).populate('teacherId', 'name email');
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    classDoc.status = 'published';
    classDoc.rejectionReason = undefined;
    await classDoc.save();

    // Mark related admin notifications as read
    await Notification.updateMany(
      { classId: classDoc._id, type: 'class_approval_request' },
      { $set: { isRead: true } }
    );

    // Notify teacher
    await Notification.create({
      userId: classDoc.teacherId._id,
      message: `🎉 Your class "${classDoc.title}" has been approved and is now published!`,
      type: 'info',
      classId: classDoc._id
    });

    // Email teacher
    await sendEmail({
      to: classDoc.teacherId.email,
      subject: `TuitionHub — Your class "${classDoc.title}" is now LIVE!`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#10b981,#059669);padding:24px 28px;">
            <h2 style="margin:0;color:#fff;font-size:20px;font-weight:700;">🎉 Class Approved!</h2>
          </div>
          <div style="padding:24px 28px;">
            <p style="font-size:15px;color:#cbd5e1;">Hello ${classDoc.teacherId.name},</p>
            <p style="font-size:14px;color:#94a3b8;">Your class <strong style="color:#f1f5f9;">"${classDoc.title}"</strong> has been reviewed and approved by the admin. It is now live and visible to students.</p>
          </div>
          <div style="padding:14px 28px;background:#1e293b;font-size:12px;color:#475569;text-align:center;">
            TuitionHub · ${new Date().toLocaleString()}
          </div>
        </div>
      `
    });

    res.json({ message: 'Class approved and published', class: classDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Reject a pending class
// @route   PUT /api/admin/classes/:id/reject
// @access  Private (Admin)
router.put('/classes/:id/reject', protect, admin, async (req, res) => {
  try {
    const { reason } = req.body;
    const classDoc = await Class.findById(req.params.id).populate('teacherId', 'name email');
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    classDoc.status = 'rejected';
    classDoc.rejectionReason = reason || 'No reason provided';
    await classDoc.save();

    // Mark related admin notifications as read
    await Notification.updateMany(
      { classId: classDoc._id, type: 'class_approval_request' },
      { $set: { isRead: true } }
    );

    // Notify teacher
    await Notification.create({
      userId: classDoc.teacherId._id,
      message: `Your class "${classDoc.title}" was not approved. Reason: ${classDoc.rejectionReason}`,
      type: 'info',
      classId: classDoc._id
    });

    res.json({ message: 'Class rejected', class: classDoc });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
