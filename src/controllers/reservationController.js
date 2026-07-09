import Reservation from '../models/Reservation.js';
import Class from '../models/Class.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';
import sendEmail from '../utils/sendEmail.js';
import { getReservationApprovedEmail, getSeatBookingRequestEmail, getSeatBookingApprovedTeacherEmail } from '../utils/emailTemplates.js';


// @desc    Create a reservation
// @route   POST /api/reservations
// @access  Private (Student)
export const createReservation = async (req, res) => {
  try {
    const { classId } = req.body;

    const targetClass = await Class.findById(classId);
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check capacity
    const currentReservations = await Reservation.countDocuments({ classId, status: { $ne: 'cancelled' } });
    if (currentReservations >= targetClass.capacity) {
      return res.status(400).json({ message: 'Class is full' });
    }

    // Check existing reservation
    let existing = await Reservation.findOne({ classId, studentId: req.user._id });
    let created;

    if (existing) {
      if (existing.status !== 'cancelled') {
        return res.status(400).json({ message: 'You have already reserved a seat for this class' });
      }
      // Reactivate cancelled reservation
      existing.status = 'pending';
      existing.reservationDate = Date.now();
      created = await existing.save();
    } else {
      const reservation = new Reservation({
        classId,
        studentId: req.user._id,
        status: 'pending'
      });
      created = await reservation.save();
    }

    // Create notifications
    await Notification.create({
      userId: req.user._id,
      message: `Your request to book a seat in "${targetClass.title}" has been sent to the Admin and is pending approval.`
    });

    await Notification.create({
      userId: targetClass.teacherId,
      message: `Student ${req.user.name} (${req.user.email}) has requested to book a seat in your class "${targetClass.title}".`,
      type: 'info'
    });

    // Notify admins for approval
    await notifyAdmins(`Student ${req.user.name} (${req.user.email}) requested to book a seat in class "${targetClass.title}". Pending Admin approval.`, 'reservation_request', created._id);

    // Send email to teacher
    try {
      const teacher = await User.findById(targetClass.teacherId);
      if (teacher && teacher.email) {
        await sendEmail({
          to: teacher.email,
          subject: 'TuitionHub - New Seat Booking Request',
          html: getSeatBookingRequestEmail(teacher.name, req.user.name, req.user.email, req.user.phone || 'N/A', targetClass.title)
        });
      }
    } catch (emailErr) {
      console.error('Failed to send seat booking request email:', emailErr);
    }

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's reservations
// @route   GET /api/reservations/my
// @access  Private (Student)
export const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ studentId: req.user._id })
      .populate({
        path: 'classId',
        populate: {
          path: 'teacherId',
          select: 'name email'
        }
      });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel a reservation
// @route   PATCH /api/reservations/:id/cancel
// @access  Private (Student)
export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Check authorization (must be the student who made the reservation)
    if (reservation.studentId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to cancel this reservation' });
    }

    reservation.status = 'cancelled';
    const updated = await reservation.save();

    // Notify admins
    await notifyAdmins(`A student (ID: ${req.user._id}) cancelled their reservation for class ID: ${reservation.classId}.`);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Confirm a reservation
// @route   PATCH /api/reservations/:id/confirm
// @access  Private (Admin)
export const confirmReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const targetClass = await Class.findById(reservation.classId);
    if (!targetClass) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Check authorization (must be admin)
    if (req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to confirm this reservation. Admin access required.' });
    }

    reservation.status = 'confirmed';
    const updated = await reservation.save();

    // Create notification for student
    await Notification.create({
      userId: reservation.studentId,
      message: `Your seat for "${targetClass.title}" has been successfully booked and approved!`
    });

    let studentName = 'unknown';
    // Send Email to Student
    try {
      const student = await User.findById(reservation.studentId);
      const teacher = await User.findById(targetClass.teacherId);
      if (student) {
        studentName = student.name;
        if (student.email) {
          await sendEmail({
            to: student.email,
            subject: `Seat Confirmed: ${targetClass.title}`,
            html: getReservationApprovedEmail(student.name, targetClass.title, teacher ? teacher.name : 'Your Teacher')
          });
        }
      }
      
      // Also send email to teacher
      if (teacher && teacher.email) {
        await sendEmail({
          to: teacher.email,
          subject: `TuitionHub - Seat Booking Approved`,
          html: getSeatBookingApprovedTeacherEmail(teacher.name, studentName, targetClass.title)
        });
      }
    } catch (emailErr) {
      console.error('Failed to send reservation approval emails:', emailErr);
    }

    // Notify admins (optional, maybe not needed since admin did it, but kept for audit)
    await notifyAdmins(`Admin (ID: ${req.user._id}) confirmed a reservation for student ${studentName} in class "${targetClass.title}".`);

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reservations for teacher's classes
// @route   GET /api/reservations/teacher
// @access  Private (Teacher)
export const getTeacherReservations = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user._id });
    const classIds = classes.map(c => c._id);

    const reservations = await Reservation.find({ classId: { $in: classIds } })
      .populate('studentId', 'name email profilePicture')
      .populate('classId', 'title subject grade isOnline groupLink schedule location fee');
      
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
