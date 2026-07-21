import express from 'express';
import { 
  registerUser, 
  loginUser, 
  verifyEmail, 
  resendOTP, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/register', upload.single('profilePicture'), registerUser);
router.post('/login', loginUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
