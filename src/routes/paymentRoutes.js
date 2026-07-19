import express from 'express';
import {
  initiateTeacherPayment,
  getTeacherPaymentStatus,
  initiateClassPayment,
  getClassPaymentStatus,
  getClassPaymentHistory,
  payhereNotify
} from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const paymentRouter = express.Router();

// PayHere calls this directly (server-to-server) — must stay public, no auth token
paymentRouter.post('/notify', payhereNotify);

// Teacher registration fee
paymentRouter.post('/teacher/initiate', protect, initiateTeacherPayment);
paymentRouter.get('/teacher/status', protect, getTeacherPaymentStatus);

// Class monthly fee
paymentRouter.post('/class/:classId/initiate', protect, initiateClassPayment);
paymentRouter.get('/class/:classId/status', protect, getClassPaymentStatus);
paymentRouter.get('/class/:classId/history', protect, getClassPaymentHistory);

export default paymentRouter;