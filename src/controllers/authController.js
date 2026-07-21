import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { notifyAdmins } from '../utils/notifyAdmins.js';
import sendEmail from '../utils/sendEmail.js';
import { getRegistrationPendingEmail, getPasswordResetEmail } from '../utils/emailTemplates.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, role, phone, teacherDetails } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const isTeacher = role === 'teacher';

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      status: 'pending',
      phone,
      isEmailVerified: true,
      ...(isTeacher && {
        teacherDetails: { ...teacherDetails, paymentStatus: 'unpaid' }
      })
    });

    if (user) {
      if (isTeacher) {
        // Don't notify admins yet — wait for the registration fee to clear.
        sendEmail({
          to: user.email,
          subject: 'TuitionHub - Complete Your Registration Payment',
          html: getRegistrationPendingEmail(user.name)
        });

        return res.status(201).json({
          message: 'Account created. Please log in to complete your registration fee payment.',
          email: user.email,
          requiresPayment: true
        });
      }

      sendEmail({
        to: user.email,
        subject: 'TuitionHub - Registration Received',
        html: getRegistrationPendingEmail(user.name)
      });

      notifyAdmins(`A new ${user.role} (${user.name}) has registered.`, 'registration_request', user._id);

      res.status(201).json({
        message: 'Registration successful. Please wait for admin approval.',
        email: user.email,
        needsVerification: false
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(res, user._id, user.role);

      if (user.role === 'teacher' && user.teacherDetails?.paymentStatus !== 'completed') {
        return res.status(402).json({
          message: 'Registration fee payment required before you can proceed',
          requiresPayment: true,
          token,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        });
      }

      if (user.status === 'pending') {
        return res.status(403).json({
          message: 'Your account is pending admin approval'
        });
      }

      if (user.status === 'rejected') {
        return res.status(403).json({
          message: 'Your account registration was rejected'
        });
      }

      if (user.role !== 'admin') {
        notifyAdmins(`${user.role === 'teacher' ? 'Teacher' : 'Student'} ${user.name} just logged in.`);
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    if (user.emailVerificationOTP !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.otpExpires = undefined;
    await user.save();

    const token = generateToken(res, user._id, user.role);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isEmailVerified) return res.status(400).json({ message: 'Email already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailVerificationOTP = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'TuitionHub - Your New Verification Code',
      html: getOTPVerificationEmail(user.name, otp)
    });

    res.json({ message: 'New OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'TuitionHub - Password Reset Code',
      html: getPasswordResetEmail(user.name, otp)
    });

    res.json({ message: 'Password reset OTP sent to email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.resetPasswordOTP !== otp || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};