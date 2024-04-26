import path from "path";
import fs from "fs";
import { dirname } from 'dirname-filename-esm';
import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import Users from '../../../model/user.mjs';
import Profiles from '../../../model/profiles.mjs';
import destr from "destr";

export const data = new SlashCommandBuilder()
    .setName('addall')
    .setDescription('Allows you to give a user all cosmetics. Note: This will reset all your lockers to default.')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user you want to give the cosmetics to')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false);

export async function execute(interaction) {
    const __dirname = dirname(import.meta);
    const selectedUser = interaction.options.getUser('user');
    const selectedUserId = selectedUser?.id;

    if (!selectedUserId) {
        await interaction.reply({ content: "Invalid user specified.", ephemeral: true });
        return;
    }

    const user = await Users.findOne({ discordId: selectedUserId });
    if (!user) {
        await interaction.reply({ content: "That user does not own an account", ephemeral: true });
        return;
    }

    const profile = await Profiles.findOne({ accountId: user.accountId });
    if (!profile) {
        await interaction.reply({ content: "That user does not have a profile", ephemeral: true });
        return;
    }

    const allItemsFile = fs.readFileSync(path.join(__dirname, "../../../Config/DefaultProfiles/allathena.json"), 'utf8');
    const allItems = destr(allItemsFile);
    if (!allItems || !allItems.items) {
        await interaction.reply({ content: "Failed to parse allathena.json", ephemeral: true });
        return;
    }

    try {
        await Profiles.findOneAndUpdate(
            { accountId: user.accountId },
            { $set: { "profiles.athena.items": allItems.items } },
            { new: true }
        );
        
        await interaction.reply({ content: "Successfully added all skins to the selected account", ephemeral: true });
    } catch (err) {
        console.error('Error updating user profile:', err);
        await interaction.reply({ content: "An error occurred while updating the profile.", ephemeral: true });
    }
}
 
