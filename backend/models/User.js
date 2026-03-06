const mongoose = require('mongoose')

//Schema = structure/blueprint of a user doc
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,      // This field is mandatory
        trim: true             // Removes extra spaces automatically
    },
    email:{
        type: String,
        required: true,
        unique: true,     //No 2 users can have save email
        lowercase: true,  // Always stores as lowercase
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    }
} , {
    timestamps: true     // Auto adds createdAt and updatedAt fields
})

// Model = schema + database superpowers (find, save, delete)
const User = mongoose.model('User',userSchema)

module.exports = User