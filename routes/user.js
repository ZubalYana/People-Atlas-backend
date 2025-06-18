const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const Character = require('../models/Character');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'people-atlas-avatars',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 400, height: 400, crop: 'limit' }],
    },
});

const upload = multer({ storage });

const authenticateToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('character');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error('GET USER ERROR:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = { ...req.body };

        if (req.file && req.file.path) {
            updates.photo = req.file.path;
        }

        const updatedCharacter = await Character.findOneAndUpdate(
            { owner: userId },
            updates,
            { new: true }
        );

        if (!updatedCharacter) {
            return res.status(404).json({ message: 'Character not found' });
        }

        res.json(updatedCharacter);
    } catch (error) {
        console.error('UPDATE CHARACTER ERROR:', error);
        res.status(500).json({ message: 'Server error while updating character' });
    }
});

module.exports = router;
