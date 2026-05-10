import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Account-Book API Server is running' });
});

import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';

// 라우터 연동
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} (Account-Book API)`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});
