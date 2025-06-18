const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Character = require('../models/Character');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCharacter = new Character({
            name: name || "Unnamed",
            email,
            isUser: true,
            tags: [],
            otherRelationships: [],
        });
        await newCharacter.save();


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        const newUser = new User({
            email,
            password: hashedPassword,
            character: newCharacter._id,
            isVerified: false,
            emailVerificationCode: code,
        });
        await newUser.save();

        await transporter.sendMail({
            from: `"People Atlas" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your verification code',
            html: `<p>Use the following code to verify your email: <b>${code}</b></p>`,
        });

        res.status(201).json({
            message: 'User registered. Please verify your email before logging in.',
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate('character');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { userId: user._id, characterId: user.character._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Login successful', token, user });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const user = await User.findOne({ email }).populate('character');
        if (!user || user.emailVerificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        user.isVerified = true;
        user.emailVerificationCode = undefined;
        await user.save();

        const token = jwt.sign(
            { userId: user._id, characterId: user.character._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({ message: 'Verification successful', token, user });
    } catch (err) {
        console.error("VERIFY CODE ERROR:", err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;