require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with support for local and staging origins
app.use(cors({
  origin: '*', // Allow all origins for the assessment's deployed API simplicity
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Routes
app.use('/api/tickets', ticketRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Root fallback route
app.get('/', (req, res) => {
  res.send('DeskFlow API Server is running.');
});

// Database connection & Server Boot
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deskflow';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully.');
    app.listen(PORT, () => {
      console.log(`DeskFlow server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB database connection error:', err);
    process.exit(1);
  });
