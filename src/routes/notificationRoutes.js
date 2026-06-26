import express from 'express';
import { getNotifications, markAsRead, sendMessage } from '../controllers/notificationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/message')
  .post(protect, sendMessage);

router.route('/:id/read')
  .put(protect, markAsRead);

export default router;
