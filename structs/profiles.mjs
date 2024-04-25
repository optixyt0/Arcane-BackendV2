import path from "path";
import log from "./log.mjs";
import { dirname } from 'dirname-filename-esm';
import fs from "fs";

const __dirname = dirname(import.meta);

async function createProfiles(accountId) {
    log.debug(`Creating profiles for account ${accountId}`);

    let profiles = {};

    fs.readdirSync(path.join(__dirname, "../Config/DefaultProfiles/")).forEach(fileName => {
        const profile = JSON.parse(fs.readFileSync(path.join(__dirname, `../../Config/DefaultProfiles/${fileName}`), 'utf-8'));

        profile.accountId = accountId;
        profile.created = new Date().toISOString();
        profile.updated = new Date().toISOString();

        profiles[profile.profileId] = profile;
        log.debug(`Created profile ${profile.profileId} for account ${accountId}`);
    });

    return profiles;
}

async function validateProfile(profileId, profiles) {
    try {
        let profile = profiles[profileId];

        if (!profile || !profileId) throw new Error("Invalid profile/profileId");
    } catch {
        return false;
    }

    return true;
}

export default { createProfiles, validateProfile };
