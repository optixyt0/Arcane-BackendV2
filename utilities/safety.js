import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { z } from "zod";

import { dirname } from 'dirname-filename-esm'

const __dirname = dirname(import.meta)

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const configSchema = z.object({
    MONGO_URI: z.string(),
    BOT_TOKEN: z.string(),
    CLIENT_ID: z.string(),
    GUILD_ID: z.string(),
    NAME: z.string(),
    PORT: z.number(),
    GAME_SERVERS: z.array(z.string()),
    MATCHMAKER_IP: z.string(),
    MAIN_SEASON: z.number(),
    USE_S3: z.boolean(),
    S3_BUCKET_NAME: z.string(),
    S3_ENDPOINT: z.string(),
    S3_ACCESS_KEY_ID: z.string(),
    S3_SECRET_ACCESS_KEY: z.string(),
    USE_REDIS: z.boolean(),
    REDIS_URL: z.string(),
    ENABLE_CROSS_BANS: z.boolean(),
    ENABLE_CLOUD: z.boolean(),
    DEBUG_LOG: z.boolean(),
});

class Safety {
    convertToBool(value, key) {
        if (value === "true") {
            return true;
        } else if (value === "false") {
            return false;
        } else {
            throw new Error(`The environment variable ${key} is not true or false, please declare it correctly in the .env file. Value: ${value}`);
        }
    }

    constructor() {
        this.isDev = process.env.USERENVIROMENT === "development";

        this.env = {
            MONGODB_URI: process.env.MONGODB_URI,
            BOT_TOKEN: process.env.BOT_TOKEN,
            CLIENT_ID: process.env.CLIENT_ID,
            GUILD_ID: process.env.GUILD_ID,
            NAME: process.env.NAME,
            PORT: parseInt(process.env.PORT),
           // GAME_SERVERS: process.env.GAME_SERVERS?.split(" "),
           // MATCHMAKER_IP: process.env.MATCHMAKER_IP,
            GAME_VER: parseInt(process.env.GAME_VER),
            LAUNCHER_VER: parseInt(process.env.LAUNCHER_VER),
          /*  USE_S3: this.convertToBool(process.env.USE_S3, "USE_S3"),
            S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
            S3_ENDPOINT: process.env.S3_ENDPOINT,
            S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
            S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
            USE_REDIS: this.convertToBool(process.env.USE_REDIS, "USE_REDIS"),
            REDIS_URL: process.env.REDIS_URL,
            ENABLE_CROSS_BANS: this.convertToBool(process.env.ENABLE_CROSS_BANS, "ENABLE_CROSS_BANS"),
            ENABLE_CLOUD: this.convertToBool(process.env.ENABLE_CLOUD, "ENABLE_CLOUD"),
            DEBUG_LOG: this.convertToBool(process.env.DEBUG_LOG, "DEBUG_LOG"), */
        };
    }

    async airbag() {
        try {
            const stateDir = path.join(__dirname, ".././state/");
            if (!fs.existsSync(stateDir)) fs.mkdirSync(stateDir);
    
            if (parseInt(process.version.slice(1)) < 18) {
                throw new Error(`Your node version is too old, please update to at least 18. Your version: ${process.version}`);
            }
    
            const tokens = JSON.stringify({ "accessTokens": [], "refreshTokens": [], "clientTokens": [] });
    
            const tokensPath = path.resolve(__dirname, "../../tokens.json");
            if (!fs.existsSync(tokensPath)) fs.writeFileSync(tokensPath, tokens);
    
            let missingVariables = Object.entries(this.env)
                .filter(([key, value]) => value === undefined && key !== "CLIENT_ID" && key !== "GUILD_ID")
                .map(([key]) => key);
    
            if (missingVariables.length > 0) {
                throw new TypeError(`The environment ${missingVariables.length > 1 ? "variables" : "variable"} ${missingVariables.join(", ")} ${missingVariables.length > 1 ? "are" : "is"} missing, please declare ${missingVariables.length > 1 ? "them" : "it"} in the .env file.`);
            }
    
            this.env.NAME = this.env.NAME?.replace(/ /g, "_");
    
            return true;
        } catch (error) {
            console.error("Error in airbag(): ", error);
            return false;
        }
    }
}

export default new Safety();

