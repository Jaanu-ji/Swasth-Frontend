// ✅ Swasth Backend Server
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import { fileURLToPath } from 'url';

// ESM __dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before importing routes
dotenv.config();

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import dietRoutes from './routes/diet.js';
import emergencyRoutes from './routes/emergency.js';
import ocrRoutes from './routes/ocr.js';
import insightsRoutes from './routes/insights.js';
import familyRoutes from './routes/family.js';
import healthRoutes from './routes/health.js';
import mealRoutes from './routes/meal.js';
import workoutRoutes from './routes/workout.js';
import vaccinationRoutes from './routes/vaccination.js';
import reminderRoutes from './routes/reminder.js';
import medicalHistoryRoutes from './routes/medicalHistory.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}
app.use('/uploads', express.static(uploadsDir));

// Fix DNS resolution for MongoDB Atlas (use Google DNS)
dns.setServers(['8.8.8.8', '8.8.4.4']);

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI, { dbName: 'swasth' })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/diet', dietRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/vaccinations', vaccinationRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/medical-history', medicalHistoryRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Swasth Backend API' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

