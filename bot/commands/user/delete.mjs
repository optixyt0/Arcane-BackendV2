import { ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder, ActionRowBuilder } from 'discord.js';
import Users from '../../../model/user.mjs';
import Profiles from '../../../model/profiles.mjs';
import Friends from '../../../model/friends.mjs';

export const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Deletes your account (irreversible)');

export async function execute(interaction) {
    const user = await Users.findOne({ discordId: interaction.user.id });
    if (!user) {
        await interaction.reply({ content: "You are not registered!", ephemeral: true });
        return;
    }
    if (user.banned) {
        await interaction.reply({ content: "You are banned, and your account cannot therefore be deleted.", ephemeral: true });
        return;
    }

    const footer = {
        text: process.env.FOOTER_TEXT || "ArcaneV2",
        iconURL: process.env.ICON_URL || "https://cdn.discordapp.com/avatars/1210734224621961256/53bf1cc27685b20d69e42a0402da5b0e.png?size=256"
    };

    const confirmButton = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Confirm Deletion')
        .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancel')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder()
        .addComponents(confirmButton, cancelButton);

    const confirmationEmbed = new EmbedBuilder()
        .setTitle("Are you sure you want to delete your account?")
        .setDescription("This action is irreversible, and will delete all your data.")
        .setColor("#2b2d31")
        .setFooter(footer)
        .setTimestamp();

    await interaction.reply({
        embeds: [confirmationEmbed],
        components: [row],
        ephemeral: true
    });

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

    collector.on("collect", async i => {
        if (i.customId === "confirm") {
            await Users.findOneAndDelete({ discordId: interaction.user.id });
            await Profiles.findOneAndDelete({ accountId: user.accountId });
            await Friends.findOneAndDelete({ accountId: user.accountId });

            const confirmEmbed = new EmbedBuilder()
                .setTitle("Account Deleted")
                .setDescription("Your account has been deleted, we're sorry to see you go!")
                .setColor("#2b2d31")
                .setFooter(footer)
                .setTimestamp();

            await i.update({ embeds: [confirmEmbed], components: [] });
        } else if (i.customId === "cancel") {
            const cancelEmbed = new EmbedBuilder()
                .setTitle("Account Deletion Cancelled")
                .setDescription("Your account has not been deleted.")
                .setColor("#2b2d31")
                .setFooter(footer)
                .setTimestamp();

            await i.update({ embeds: [cancelEmbed], components: [] });
        }
    });
}

