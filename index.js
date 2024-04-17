const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');

const port = 3551;

app.listen(port, () => {
    console.log(`Arcane Backend running on port ${port}`);
});

async function connectDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/arcane', {
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