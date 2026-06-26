import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Read the user from database to ensure they still exist
      req.user = await User.findById(decoded.userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Attach the decoded token payload (which contains user.role) to the request
      req.tokenPayload = decoded;
      
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
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

