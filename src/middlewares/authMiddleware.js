import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // Support Bearer header (primary) and cookie (if you also set one on login)
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // IMPORTANT: no status/approval check here — a pending, unpaid teacher
    // must still be able to hit /api/payment/teacher/initiate.
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
// Middleware to guard Student routes
export const student = (req, res, next) => {
  const role = req.tokenPayload?.role || req.user?.role;
  if (role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as student' });
  }
};

// Middleware to guard Teacher routes
export const teacher = (req, res, next) => {
  const role = req.tokenPayload?.role || req.user?.role;
  if (role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as teacher' });
  }
};

// Middleware to guard Admin routes
export const admin = (req, res, next) => {
  const role = req.tokenPayload?.role || req.user?.role;
  if (role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

