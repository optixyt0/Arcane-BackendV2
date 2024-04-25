const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

let log;
let error;
const loggedUrls = new Set();

async function initializeModules() {
    try {
        const logModule = await import('./structs/log.mjs');
        log = logModule.default;
        const errorModule = await import('./structs/error.mjs');
        error = errorModule.default;
    } catch (err) {
        console.error('Failed to load modules:', err);
        process.exit(1);
    }
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        log.backend(`ArcaneV2 running on port ${port}`);
        connectDB();
        loggedUrls.add("/v1/version");
    }).on("error", async (err) => {
        if (err.message == "EADDRINUSE") {
            log.error(`Port ${port} is already in use!\nClosing in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            process.exit(0);
        } else throw err;
    });

    app.get('/v1/version', function (req, res) {
        res.json({ version: process.env.LAUNCHER_VER });
    });

    /*app.use((req, res, next) => {
        const url = req.originalUrl;
        if (!loggedUrls.has(url)) {
            log.debug(`Missing endpoint: ${req.method} ${url} request port ${req.socket.localPort}`);
            error.createError(
                "errors.com.epicgames.common.not_found",
                "Sorry, the resource you were trying to find could not be found.",
                undefined, 1004, undefined, 404, res
            );
        }
        next();
    });*/
}

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const testDB = mongoose.model('connectionTest', { successful: String });
        const testDocument = new testDB({ successful: 'Yes' });
        await testDocument.save();
        log.backend('Connected to MongoDB!');
        await testDB.deleteMany({});
    } catch (err) {
        log.error(err);
    }
}

initializeModules();
