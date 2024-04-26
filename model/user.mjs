import mongoose from 'mongoose';

/**
 * User model schema.
 * Defines the structure of the user document.
 * @typedef {Object} User
 * @property {Date} created - The date the user was created.
 * @property {boolean} banned - Indicates whether the user is banned.
 * @property {string} discordId - The user's Discord ID.
 * @property {string} accountId - The unique account identifier.
 * @property {string} username - The user's username.
 * @property {string} username_lower - The lowercase version of the username.
 * @property {string} email - The user's email address.
 * @property {string} password - The user's hashed password.
 * @property {boolean} mfa - Indicates whether MFA is enabled.
 * @property {string} matchmakingId - ID used for matchmaking purposes.
 * @property {boolean} canCreateCodes - Indicates whether the user can create codes.
 * @property {boolean} isServer - Indicates if the account is used as a server.
 */

const UserSchema = new mongoose.Schema({
    created: { type: Date, required: true },
    banned: { type: Boolean, default: false },
    discordId: { type: String, required: true, unique: true },
    accountId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    username_lower: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mfa: { type: Boolean, default: false },
    matchmakingId: { type: String, default: null },
    canCreateCodes: { type: Boolean, default: false },
    isServer: { type: Boolean, default: false }
}, {
    collection: 'users'
});

const User = mongoose.model('User', UserSchema);

export default User;

