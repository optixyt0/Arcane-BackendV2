import { ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Users from '../../../model/user.mjs';
import Profiles from '../../../model/profiles.mjs';

export const data = new SlashCommandBuilder()
    .setName('vbucks')
    .setDescription('Lets you change a user\'s amount of vBucks')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user you want to change the vBucks of')
            .setRequired(true))
    .addIntegerOption(option =>
        option.setName('vbucks')
            .setDescription('The amount of vBucks to give (can be negative to subtract)')
            .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false);

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const selectedUser = interaction.options.getUser('user');
    const vbucksAmount = interaction.options.getInteger('vbucks');

    if (!selectedUser) {
        await interaction.editReply({ content: "Unable to fetch the user details.", ephemeral: true });
        return;
    }

    const user = await Users.findOne({ discordId: selectedUser.id });
    if (!user) {
        await interaction.editReply({ content: "That user does not own an account.", ephemeral: true });
        return;
    }
    
            const footer = {
        text: process.env.FOOTER_TEXT || "ArcaneV2",
        iconURL: process.env.ICON_URL || "https://cdn.discordapp.com/avatars/1210734224621961256/53bf1cc27685b20d69e42a0402da5b0e.png?size=256"
    };

    const updatedProfile = await Profiles.findOneAndUpdate(
        { accountId: user.accountId },
        { $inc: { 'vBucks': vbucksAmount } },
        { new: true }
    );

    if (!updatedProfile) {
        await interaction.editReply({ content: "That user does not have a profile.", ephemeral: true });
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("vBucks Updated")
        .setDescription(`Successfully updated the amount of vBucks for <@${selectedUser.id}> by ${vbucksAmount}.`)
        .setColor("#2b2d31")
        .setThumbnail("data:image/jpeg;base64,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")
        .setFooter(footer)
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
}
 
