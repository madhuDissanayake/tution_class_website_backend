import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
