const mongoose = require('mongoose')

// Each month's breakdown in the amortization schedule
const amortizationSchema = new mongoose.Schema({
   month: Number,           // Month number (1, 2, 3...)
    openingBalance: Number,  // Balance at start of month
    emi: Number,             // Fixed EMI amount
    principal: Number,       // Principal component of this EMI
    interest: Number,        // Interest component of this EMI
    closingBalance: Number   // Balance after this EMI
}, { _id: false });          // No separate ID needed for each month


const calculationSchema = new mongoose.Schema({
     userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Inputs
    principal: { type: Number, required: true },
    annualRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    // Results
    emi: { type: Number, required: true },
    totalPayment: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    // Full schedule
    amortizationSchedule: [amortizationSchema]
}, {
    timestamps: true
})


module.exports = mongoose.model('Calculation', calculationSchema)