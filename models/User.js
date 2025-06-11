const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationCode: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
