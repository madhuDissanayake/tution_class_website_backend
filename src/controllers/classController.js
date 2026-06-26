import Class from '../models/Class.js';
import Review from '../models/Review.js';
import Reservation from '../models/Reservation.js';
import Notification from '../models/Notification.js';
import { notifyAdmins } from '../utils/notifyAdmins.js';

// @desc    Get all classes (with search and filters)
// @route   GET /api/classes
// @access  Public
export const getClasses = async (req, res) => {
  try {
    const { subject, grade, medium, search, teacherId } = req.query;
    let query = {};
    
    if (subject) query.subject = subject;
    if (grade) query.grade = grade;
    if (medium) query.medium = medium;
    if (teacherId) query.teacherId = teacherId;
    if (search) {
      query.title = { $regex: search, $options: 'i' };
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

// @desc    Create a class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = async (req, res) => {
  try {
    const { teacherId } = req.body;
    if (!teacherId) {
       return res.status(400).json({ message: 'teacherId is required' });
    }
    const newClass = new Class({
      ...req.body
    });
    
    const createdClass = await newClass.save();
    
    // Notify the teacher that a class has been created for them
    await Notification.create({
      userId: teacherId,
      message: `Admin has created a new class for you: "${createdClass.title}"`,
      type: 'info',
      classId: createdClass._id
    });

    res.status(201).json(createdClass);
  } catch (error) {
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
