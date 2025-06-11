const express = require('express');
const app = express();
const dotenv = require('dotenv').config();
const PORT = process.env.PORT || 5000;
const mongoose = require('mongoose')
const cors = require('cors')
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const characterRoutes = require('./routes/character')
app.use('/characters', characterRoutes)

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));