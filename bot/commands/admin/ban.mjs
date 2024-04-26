import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Users from '../../../model/user.mjs';
import functions from "../../../structs/functions.mjs";

export const data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bans a user\'s account')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user whose account you want to ban')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('reason')
            .setDescription('The reason for banning the account')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false);

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const reason = interaction.options.getString('reason');
    const targetUserDiscord = interaction.options.getUser('user');
    const targetUser = await Users.findOne({ discordId: targetUserDiscord?.id });

    if (!targetUser) {
        await interaction.editReply({ content: "The account username you entered does not exist." });
        return;
    }
    if (targetUser.banned) {
        await interaction.editReply({ content: "This account is already banned." });
        return;
    }

        const footer = {
        text: process.env.FOOTER_TEXT || "ArcaneV2",
        iconURL: process.env.ICON_URL || "https://cdn.discordapp.com/avatars/1210734224621961256/53bf1cc27685b20d69e42a0402da5b0e.png?size=256"
    };
    await Users.updateOne({ discordId: targetUserDiscord.id }, { $set: { banned: true } });

    // Token cleanup logic could be encapsulated in a helper function if repeated elsewhere
    const refreshTokenIndex = global.refreshTokens.findIndex(i => i.accountId == targetUser.accountId);
    const accessTokenIndex = global.accessTokens.findIndex(i => i.accountId == targetUser.accountId);
    let tokensUpdated = false;

    if (refreshTokenIndex != -1) {
        global.refreshTokens.splice(refreshTokenIndex, 1);
        tokensUpdated = true;
    }
    if (accessTokenIndex != -1) {
        global.accessTokens.splice(accessTokenIndex, 1);
        tokensUpdated = true;
    }

    const xmppClient = global.Clients.find(client => client.accountId == targetUser.accountId);
    xmppClient?.client.close();

    if (tokensUpdated) {
        await functions.UpdateTokens(); 
    }

    const embed = new EmbedBuilder()
        .setTitle("Account Banned")
        .setDescription(`User with name ${targetUserDiscord?.username} has been banned.`)
        .addFields({ name: "Reason", value: reason })
        .setColor("#2b2d31")
        .setFooter(footer)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    targetUserDiscord?.send({ content: "Your account has been banned by an administrator." });
}
 
