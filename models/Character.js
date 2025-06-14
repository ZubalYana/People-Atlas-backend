const mongoose = require('mongoose')

const characterSchema = new mongoose.Schema({
    isUser: {
        type: Boolean,
        default: false,
    },
    userAuth: {
        email: String,
        password: String,
        authProvider: String,
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
    },
    photo: {
        type: String
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    nickname: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    instagram: {
        type: String
    },
    telegram: {
        type: String
    },
    facebook: {
        type: String
    },
    address: {
        type: String,
        trim: true
    },
    tags: {
        type: Array
    },
    otherRelationships: {
        type: Array
    },
    birthday: {
        type: String
    },
    interests: {
        type: [String],
        default: [],
    },
    relatedEvents: {
        type: String,
        trim: true
    },
    howDidYouMeet: {
        type: String,
        trim: true
    },
    notes: {
        type: String,
        trim: true
    }
});

module.exports = mongoose.model('Character', characterSchema)