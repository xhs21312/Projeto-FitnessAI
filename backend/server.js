require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./src/routes/auth');
const workoutRoutes = require('./src/routes/workout');
const userRoutes = require('./src/routes/user');
const watchDataRoutes = require('./src/routes/watchData');
const nutritionRoutes = require('./src/routes/nutrition');
const aiRoutes = require('./src/routes/ai');
const chatRoutes = require('./src/routes/chat');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/users', userRoutes);
app.use('/api/watch-data', watchDataRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({
    message: 'Fitness AI Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      workouts: '/api/workouts',
      users: '/api/users',
      watchData: '/api/watch-data',
      nutrition: '/api/nutrition',
      ai: '/api/ai',
      chat: '/api/chat'
    }
  });
});

app.listen(PORT, () => {
  console.log(`Fitness AI Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database: Supabase`);
});
