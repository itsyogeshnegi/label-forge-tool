import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';

import connectDB from './config/db.js';
import User from './models/User.js';
import authRoutes from './routes/authRoutes.js';
import labelRoutes from './routes/labelRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Load config
dotenv.config();

// Connect to Database
connectDB().then(() => {
  seedAdminUser();
});

const app = express();

// Security Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP temporarily if it impacts local image/API fetches, or leave customizable
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin);

    if (process.env.NODE_ENV !== 'production' || isLocalhost || isAllowed) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', apiLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/stats', statsRoutes);

// Setup for production build (static files serving)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from 'fs';

const distPath = path.join(__dirname, '../frontend/dist');

if (process.env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running successfully...');
  });
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Seed admin user
async function seedAdminUser() {
  try {
    const adminEmail = 'pahadse.store';
    const adminPassword = 'pahadse0513';
    const adminName = 'Super Admin';

    const adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      console.log('Super-admin user not found. Seeding new credentials...');
      // Delete any old admin users
      await User.deleteMany({});
      
      const hashedPassword = await bcryptjs.hash(adminPassword, 10);
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword
      });
      console.log('--------------------------------------------------');
      console.log('SUPER-ADMIN USER SEEDED SUCCESSFUL:');
      console.log(`ID: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log('--------------------------------------------------');
    } else {
      // Verify password and update if mismatched
      const isMatch = await adminUser.matchPassword(adminPassword);
      if (!isMatch) {
        console.log('Updating super-admin password in database...');
        adminUser.password = await bcryptjs.hash(adminPassword, 10);
        await adminUser.save();
      }
    }
  } catch (error) {
    console.error('Failed to seed admin user:', error.message);
  }
}


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
