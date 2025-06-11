const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Character = require('../models/Character');

router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(409).json({ message: 'Email already in use' });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newCharacter = new Character({ name, email });
        await newCharacter.save();

        const newUser = new User({
            email,
            password: hashedPassword,
            character: newCharacter._id
        });

        await newUser.save();

        const token = jwt.sign(
            { userId: newUser._id, characterId: newCharacter._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ message: 'User registered', token, user: newUser, character: newCharacter });
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
