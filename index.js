const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Arcane Backend running on port ${port}`);
});

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
        });
        const testDB = mongoose.model('connectionTest',{ successful: String });
        const testDocument = new testDB({ successful: String });
        await testDocument.save();
        console.log('Arcane Backend Successfully Connected to MongoDB!');
        await testDB.deleteMany({});
    } catch (err) {
        console.log(err);
    }
}

connectDB();
