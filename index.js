const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const port = process.env.PORT;

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const testDB = mongoose.model('connectionTest',{ successful: String });
        const testDocument = new testDB({ successful: String });
        await testDocument.save();
        console.log('Connected to MongoDB!');
        await testDB.deleteMany({});
    } catch (err) {
        console.log(err);
    }
}

app.listen(port, () => {
    console.log(`ArcaneV2 running on port ${port}`);
});


connectDB();
