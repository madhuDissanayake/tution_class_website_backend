import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import classRoutes from './routes/classRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import paymentRouter from './routes/paymentRoutes.js';
import earningRoutes from './routes/earningRoutes.js';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = [
  'http://localhost:5173',
  'https://project-ikmzi.vercel.app',
  'https://tuitionhub.madhudissanayake.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));;
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // required for PayHere's notify_url payload

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

// Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per window
  message: {
    message: 'Too many attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/payment', paymentRouter);
app.use('/api/earnings', earningRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err.message);
  });
