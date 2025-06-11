const express = require('express')
const router = express.Router()
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../cloudinaryConfig')
const Character = require('../models/Character')

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'characters',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp']
    }
})

const upload = multer({ storage: storage })

router.post('/', upload.single("photo"), async (req, res) => {
    try {
        const characterPhoto = req.file?.path || null;

        const {
            name,
            lastName,
            patronymic,
            nickname,
            phone,
            email,
            instagram,
            telegram,
            facebook,
            address,
            tags,
            otherRelationships,
            birthday,
            interests,
            relatedEvents,
            howDidYouMeet,
            notes
        } = req.body;

        const newCharacter = new Character({
            photo: characterPhoto,
            name,
            lastName,
            patronymic,
            nickname,
            phone,
            email,
            instagram,
            telegram,
            facebook,
            address,
            tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
            otherRelationships: Array.isArray(otherRelationships) ? otherRelationships : otherRelationships ? [otherRelationships] : [],
            birthday,
            interests,
            relatedEvents,
            howDidYouMeet,
            notes
        });

        await newCharacter.save();
        console.log("Created Character:\n", JSON.stringify(newCharacter, null, 2));
        res.status(201).json({ message: 'Character created successfully', character: newCharacter });
    } catch (err) {
        console.error("CREATION ERROR:", err);
        res.status(500).json({ message: 'Error creating a character' });
    }
});

module.exports = router