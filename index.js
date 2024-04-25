const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
import error from "./structs/error.js";
import log from "./structs/log.js";
require('dotenv').config();

const port = process.env.PORT;

const loggedUrls = new Set<string>();

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
    connectDB();
}).on("error", async (err) => {
    if (err.message == "EADDRINUSE") {
        console.log(`Port ${PORT} is already in use!\nClosing in 3 seconds...`);
        await functions.sleep(3000)
        process.exit(0);
    } else throw err;
 
 // launcher api route, will change later   
app.get('/v1/version', function (req, res) {
  res.json("{ version: process.env.LAUNCHER_VER }");
});


app.use((req, res, next) => {
    const url = req.originalUrl;
    if (!loggedUrls.has(url)) {
        console.log(`Missing endpoint: ${req.method} ${url} request port ${req.socket.localPort}`);
        error.createError(
            "errors.com.epicgames.common.not_found",
            "Sorry, the resource you were trying to find could not be found.",
            undefined, 1004, undefined, 404, res
        );
    }
    next();
});



