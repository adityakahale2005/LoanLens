const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// CORS — allows both local and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json())

// Routes
const authRoutes = require('./routes/auth')
app.use('/api/auth', authRoutes)

const calculationRoutes = require('./routes/calculations')
app.use('/api/calculations', calculationRoutes)

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'LoanLens API is running' })
})

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.log('MongoDB connection failed:', error.message)
  })