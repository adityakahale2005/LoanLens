const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// ─── REGISTER ────────────────────────────────────────────────
// POST /api/auth/register

router.post('/register' , async(req,res) => {
    try{
        const{name , email , password } = req.body


        // Step 1: Check all fields are present
        if( !name || !email || !password ) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        // Step 2: Check if user already exists
        const existingUser = await User.findOne( { email })
        if(existingUser){
            return res.status(400).json( { message: 'Email already registered'})
        }

        // Step 3: Hash the password
         // 10 = salt rounds (how many times to scramble — higher is safer but slower)
         const hashedPassword = await bcrypt.hash(password, 10)

        // Step 4: Create and save new user
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        await user.save()


    // Step 5: Create JWT token
    // Token contains user's id, signed with your secret key, expires in 7 days
    const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn : '7d' }
    )

    res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: user._id , name: user.name , email: user.email }
    })
    } catch (error) {
        res.status(500).json({ message:'Server error' , error:error.message })
    }
})


// ─── LOGIN ────────────────────────────────────────────────────
// POST /api/auth/login
router.post('/login', async (req,res) => {
    try{
        const { email , password } = req.body

         // Step 1: Find user by email
         const User = await User.findOne({ email })
         if(!user){
            return res.status(400).json({ message: 'Invalid email or password'})
         }

         // Step 2: Compare password with stored hash
         // bcrypt.compare returns true/false
         const isMatch = await bcrypt.compare(password , user.password)
         if(!isMatch){
            return res.status(400).json({ message: 'Invalid email or password' })
         }

        // Step 3: Create JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expire:'7d' }
        )

        res.json({
            message: 'Login successful',
            token,
            user: { id: user._id, name: user.name , email: user.email }
        })
    } catch(error) {
        res.status(500).json({ message: 'Server error' , error: error.message})
    }
})

module.exports = router
