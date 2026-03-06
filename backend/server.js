const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()


// Middleware — runs on every request before it hits your routes
app.use(cors())              // Allow frontend to call this backend
app.use(express.json())      // Parse incoming JSON request bodies

// Routes (we'll add these soon)
const authRoutes = require('./routes/auth')
app.use('/api/auth',authRoutes)

// Test route — just to confirm server works
app.get('/',(req,res) => {
    res.json({message:'LoanLens API is running'})
})


//Connect to MongoDB then start server
mongoose.connect(process.env.MONGO_URI)
   .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(process.env.PORT , () => {
        console.log(`Server running on port ${process.env.PORT}`)
    })
   })
   .catch((error) => {
    console.log('MongoDB connection failed:',error.message)
   })



