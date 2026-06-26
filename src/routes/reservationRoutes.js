import express from 'express';
import { createReservation, getMyReservations, cancelReservation, confirmReservation, getTeacherReservations } from '../controllers/reservationController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createReservation);

router.route('/my')
  .get(protect, getMyReservations);

router.route('/teacher')
  .get(protect, getTeacherReservations);

router.route('/:id/cancel')
  .patch(protect, cancelReservation);

router.route('/:id/confirm')
  .patch(protect, admin, confirmReservation);

export default router;
