import Class from '../models/Class.js';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';
import sendEmail from '../utils/sendEmail.js';
import { getClassCreatedEmail } from '../utils/emailTemplates.js';

// @desc    Get all classes (with search and filters)
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res) => {
  try {
    const { subject, grade, medium, search, teacherId, isPopular, includeAll } = req.query;
    let query = {};

    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (medium) query.medium = medium;
    if (teacherId) query.teacherId = teacherId;
    if (isPopular === 'true') query.isPopular = true;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Public search only sees published classes.
    // Teachers viewing their own classes (includeAll=true) see all statuses.
    if (!includeAll) {
      query.status = { $in: ['published', null] };
    }

    const classes = await Class.find(query).populate('teacherId', 'name profilePicture');

    // Aggregation for class ratings
    const classIds = classes.map(c => c._id);
    const stats = await Review.aggregate([
      { $match: { classId: { $in: classIds } } },
      { $group: { _id: '$classId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        avgRating: stat.avg ? Math.round(stat.avg * 10) / 10 : 0,
        reviewCount: stat.count || 0
      };
    });

    const reservations = await Reservation.aggregate([
      { $match: { classId: { $in: classIds }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$classId', count: { $sum: 1 } } }
    ]);

    const enrollmentsMap = {};
    reservations.forEach(r => {
      enrollmentsMap[r._id.toString()] = r.count;
    });

    const classesWithStats = classes.map(cls => {
      const clsObj = cls.toObject();
      const classStats = statsMap[cls._id.toString()] || { avgRating: 0, reviewCount: 0 };
      const enrolled = enrollmentsMap[cls._id.toString()] || 0;
      return {
        ...clsObj,
        avgRating: classStats.avgRating,
        reviewCount: classStats.reviewCount,
        enrolledCount: enrolled,
        availableSeats: clsObj.capacity ? Math.max(0, clsObj.capacity - enrolled) : 0
      };
    });

    res.json(classesWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single class by ID
// @route   GET /api/classes/:id
// @access  Public
export const getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id).populate('teacherId', 'name email phone profilePicture');
    if (classData) {
      // Aggregation for single class rating
      const stats = await Review.aggregate([
        { $match: { classId: classData._id } },
        { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
      ]);

      const avgRating = stats.length > 0 && stats[0].avg ? Math.round(stats[0].avg * 10) / 10 : 0;
      const reviewCount = stats.length > 0 ? stats[0].count : 0;

      const reservations = await Reservation.aggregate([
        { $match: { classId: classData._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 } } }
      ]);
      const enrolledCount = reservations.length > 0 ? reservations[0].count : 0;
      const availableSeats = classData.capacity ? Math.max(0, classData.capacity - enrolledCount) : 0;

      res.json({
        ...classData.toObject(),
        avgRating,
        reviewCount,
        enrolledCount,
        availableSeats
      });
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a class (Admin always published; Teacher → pending approval)
// @route   POST /api/classes
// @access  Private (Admin or Approved Teacher)
export const createClass = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isTeacher = req.user.role === 'teacher' && req.user.status === 'approved';

    if (!isAdmin && !isTeacher) {
      return res.status(403).json({ message: 'Only approved teachers or admins can create classes' });
    }

    const { isOnline, lat, lng, address } = req.body;

    // Teacher creates for themselves; Admin specifies teacherId
    const resolvedTeacherId = isAdmin ? req.body.teacherId : req.user._id.toString();

    if (!resolvedTeacherId) {
      return res.status(400).json({ message: 'teacherId is required' });
    }

    let classData = {
      ...req.body,
      teacherId: resolvedTeacherId,
      // Admin-created → published immediately; Teacher-created → pending
      status: isAdmin ? 'published' : 'pending'
    };

    // Physical class
    if (!isOnline) {
      if (!lat || !lng) {
        return res.status(400).json({ message: 'Location coordinates required for physical class' });
      }
      classData.location = {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)],
        address
      };
    } else {
      classData.location = undefined;
    }

    const newClass = new Class(classData);
    const createdClass = await newClass.save();

    if (isAdmin) {
      // Admin created — notify teacher
      await Notification.create({
        userId: resolvedTeacherId,
        message: `Admin has created a new class for you: "${createdClass.title}"`,
        type: 'info',
        classId: createdClass._id
      });
    } else {
      // Teacher created — notify all admins for approval
      const admins = await User.find({ role: 'admin' });
      const adminNotifications = admins.map(admin => ({
        userId: admin._id,
        message: `Teacher ${req.user.name} submitted a new class for approval: "${createdClass.title}"`,
        type: 'class_approval_request',
        subjectUserId: req.user._id,
        classId: createdClass._id
      }));
      if (adminNotifications.length > 0) {
        await Notification.insertMany(adminNotifications);
      }

      // Email admins
      const adminEmailPromises = admins.map(admin =>
        sendEmail({
          to: admin.email,
          subject: `TuitionHub — Class Approval Needed: "${createdClass.title}"`,
          html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
              <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:28px 32px;">
                <h2 style="margin:0;color:#fff;font-size:20px;font-weight:700;">📚 New Class Awaiting Approval</h2>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">A teacher has submitted a class for admin review.</p>
              </div>
              <div style="padding:28px 32px;">
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <tr><td style="padding:8px 0;color:#94a3b8;width:130px;">Teacher</td><td style="padding:8px 0;color:#f1f5f9;font-weight:600;">${req.user.name}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Class Title</td><td style="padding:8px 0;color:#f1f5f9;">${createdClass.title}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Subject</td><td style="padding:8px 0;color:#f1f5f9;">${createdClass.subject}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Grade</td><td style="padding:8px 0;color:#f1f5f9;">${createdClass.grade}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Medium</td><td style="padding:8px 0;color:#f1f5f9;">${createdClass.medium}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Monthly Fee</td><td style="padding:8px 0;color:#f1f5f9;">Rs. ${createdClass.fee}</td></tr>
                  <tr><td style="padding:8px 0;color:#94a3b8;">Type</td><td style="padding:8px 0;color:#f1f5f9;">${createdClass.isOnline ? 'Online' : 'Physical'}</td></tr>
                </table>
                <div style="margin-top:24px;text-align:center;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin#pending-classes" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;padding:12px 28px;border-radius:8px;text-decoration:none;">
                    Review in Admin Dashboard →
                  </a>
                </div>
              </div>
              <div style="padding:16px 32px;background:#1e293b;font-size:12px;color:#475569;text-align:center;">
                TuitionHub Admin Alert · ${new Date().toLocaleString()}
              </div>
            </div>
          `
        })
      );
      await Promise.allSettled(adminEmailPromises);
    }

    res.status(201).json(createdClass);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: error.message });
  }
};


// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedClass);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);

    if (!classData) {
      return res.status(404).json({ message: 'Class not found' });
    }

    await classData.deleteOne();

    res.json({ message: 'Class removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
