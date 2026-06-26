import Review from '../models/Review.js';
import Class from '../models/Class.js';

// @desc    Add a review to a class
// @route   POST /api/classes/:id/reviews
// @access  Private (Student)
export const createClassReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const classId = req.params.id;

    const classData = await Class.findById(classId);

    if (classData) {
      const alreadyReviewed = await Review.findOne({
        classId,
        studentId: req.user._id,
      });

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this class' });
      }

      const review = new Review({
        studentId: req.user._id,
        classId,
        rating: Number(rating),
        comment,
      });

      await review.save();
      res.status(201).json({ message: 'Review added successfully' });
    } else {
      res.status(404).json({ message: 'Class not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get class reviews
// @route   GET /api/classes/:id/reviews
// @access  Public
export const getClassReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ classId: req.params.id }).populate('studentId', 'name profilePicture');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
