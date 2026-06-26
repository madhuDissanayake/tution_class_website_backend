import express from 'express';
import { 
  getClasses, 
  getClassById, 
  createClass, 
  updateClass, 
  deleteClass 
} from '../controllers/classController.js';
import { createClassReview, getClassReviews } from '../controllers/reviewController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getClasses)
  .post(protect, admin, createClass);

router.route('/:id')
  .get(getClassById)
  .put(protect, admin, updateClass)
  .delete(protect, admin, deleteClass);

router.route('/:id/reviews')
  .get(getClassReviews)
  .post(protect, createClassReview);

export default router;
