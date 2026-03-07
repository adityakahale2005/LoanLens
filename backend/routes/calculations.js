const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Calculation = require('../models/Calculation');
const { calculateEMI } = require('../utils/emiCalculator');

// ─── CALCULATE & SAVE ─────────────────────────────────────────
// POST /api/calculations
// Protected — requires JWT token
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { principal, annualRate, tenureMonths } = req.body;

        // Validate inputs
        if (!principal || !annualRate || !tenureMonths) {
            return res.status(400).json({ message: 'All fields required' });
        }
        if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
            return res.status(400).json({ message: 'All values must be positive' });
        }
        if (tenureMonths > 360) {
            return res.status(400).json({ message: 'Tenure cannot exceed 360 months (30 years)' });
        }

        // Run the calculation
        const result = calculateEMI(principal, annualRate, tenureMonths);

        // Save to MongoDB linked to logged-in user
        const calculation = new Calculation({
            userId: req.userId,   // Comes from auth middleware
            principal,
            annualRate,
            tenureMonths,
            emi: result.emi,
            totalPayment: result.totalPayment,
            totalInterest: result.totalInterest,
            amortizationSchedule: result.schedule
        });

        await calculation.save();

        res.status(201).json({
            message: 'Calculation saved successfully',
            emi: result.emi,
            totalPayment: result.totalPayment,
            totalInterest: result.totalInterest,
            crossoverMonth: result.crossoverMonth,
            schedule: result.schedule
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── GET ALL CALCULATIONS FOR LOGGED-IN USER ──────────────────
// GET /api/calculations
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Find only this user's calculations, newest first
        // Exclude the full schedule to keep response light
        const calculations = await Calculation.find(
            { userId: req.userId },
            { amortizationSchedule: 0 }  // Exclude schedule from list view
        ).sort({ createdAt: -1 });

        res.json({ calculations });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── GET SINGLE CALCULATION WITH FULL SCHEDULE ────────────────
// GET /api/calculations/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const calculation = await Calculation.findOne({
            _id: req.params.id,
            userId: req.userId  // Ensure user can only see their own
        });

        if (!calculation) {
            return res.status(404).json({ message: 'Calculation not found' });
        }

        res.json({ calculation });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// ─── DELETE A CALCULATION ─────────────────────────────────────
// DELETE /api/calculations/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const calculation = await Calculation.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!calculation) {
            return res.status(404).json({ message: 'Calculation not found' });
        }

        res.json({ message: 'Calculation deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;