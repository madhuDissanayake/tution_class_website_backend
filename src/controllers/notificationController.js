import Notification from '../models/Notification.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate({
        path: 'relatedId',
        populate: [
          { path: 'studentId', select: 'name email phone' },
          { path: 'classId', select: 'title' }
        ]
      })
      .populate('senderId', 'name email profilePicture')
      .populate('subjectUserId', 'name email role phone teacherDetails profilePicture status')
      .populate('classId', 'title')
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (notification && notification.userId.toString() === req.user._id.toString()) {
      notification.isRead = true;
      await notification.save();
      res.json({ message: 'Notification marked as read' });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send a message (notification)
// @route   POST /api/notifications/message
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, classId } = req.body;
    
    if (!receiverId || !message) {
      return res.status(400).json({ message: 'Receiver ID and message are required' });
    }

    const notification = await Notification.create({
      userId: receiverId,
      senderId: req.user._id,
      classId,
      message,
      type: 'message'
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
