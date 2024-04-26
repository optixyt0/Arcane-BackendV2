const express = require('express');
const app = express();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

let log;
let error;
let safety;
const loggedUrls = new Set();

async function manageTokens() {
    let tokens;
    if (safety.env.USE_REDIS === 'true') {
        try {
            const redisTokens = await kv.get('tokens');
            tokens = JSON.parse(redisTokens);
            if (!tokens) throw new Error("Failed to deserialize tokens from Redis.");
        } catch (err) {
            log.error("Redis tokens error, resetting from tokens.json: " + err.message);
            const localData = fs.readFileSync(path.join(__dirname, "tokens.json"), 'utf8');
            tokens = JSON.parse(localData);
            await kv.set('tokens', localData);
        }
    } else {
        const localData = fs.readFileSync(path.join(__dirname, "tokens.json"), 'utf8');
        tokens = JSON.parse(localData);
    }
    global.accessTokens = tokens.accessTokens;
    global.refreshTokens = tokens.refreshTokens;
    global.clientTokens = tokens.clientTokens;
}

async function initializeModules() {
    try {
        const logModule = await import('./structs/log.mjs');
        log = logModule.default;
        const errorModule = await import('./structs/error.mjs');
        error = errorModule.default;
        const safetyModule = await import('./utilities/safety.mjs');
        safety = safetyModule.default;
        const functionsModule = await import('./structs/functions.mjs');
        functions = functionsModule.default;
        const clientModule = await import('./bot/index.mjs');
        client = clientModule.default;
        await safety.airbag();
        await client.login(safety.env.BOT_TOKEN);
        global.safety = safety;
        global.safetyEnv = safety.env;
        await manageTokens();
    } catch (err) {
        console.error('Failed to load modules:', err);
        process.exit(1);
    }

    const port = safety.env.PORT || 3000;
    app.listen(port, () => {
        log.backend(safety.env.NAME + ` Backend running on port ${port}`);
        connectDB();
    }).on("error", async (err) => {
        if (err.message == "EADDRINUSE") {
            log.error(`Port ${port} is already in use!\nClosing in 3 seconds...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
            process.exit(0);
        } else throw err;
    });

    app.use((req, res, next) => {
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
    });
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

app.get('/api/v1/launcher/version', function (req, res) {
    res.json({ version: safety.env.LAUNCHER_VER });
});

app.get('/api/v1/game/version', function (req, res) {
    res.json({ version: safety.env.GAME_VER });
});

app.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        name: safety.env.NAME,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        cpuUsage: process.cpuUsage(),
        environment: process.env.NODE_ENV,
    });
});

