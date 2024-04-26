import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Users from '../../../model/user.mjs';

export const data = new SlashCommandBuilder()
    .setName('mfa')
    .setDescription('Toggles the multi-factor authentication for your account');

export async function execute(interaction) {
    const user = await Users.findOne({ discordId: interaction.user.id });
    if (!user) {
        await interaction.reply({ content: "You are not registered!", ephemeral: true });
        return;
    }

    if (!user.mfa) {
        try {
            const msg = await interaction.user.send("Checking if your DMs are enabled to enable MFA. Ignore this message if you can see it. Deleting in 10 seconds.");
            setTimeout(() => msg.delete(), 10000);
        } catch (error) {
            await interaction.reply({ content: "Please enable your DMs to use this command", ephemeral: true });
            return;
        }
    }

    const updatedUser = await Users.findOneAndUpdate(
        { discordId: interaction.user.id },
        { $set: { mfa: !user.mfa } },
        { new: true }
    );
    
        const footer = {
        text: process.env.FOOTER_TEXT || "ArcaneV2",
        iconURL: process.env.ICON_URL || "https://cdn.discordapp.com/avatars/1210734224621961256/53bf1cc27685b20d69e42a0402da5b0e.png?size=256"
    };

    const embed = new EmbedBuilder()
        .setTitle(`MFA ${updatedUser?.mfa ? "Enabled" : "Disabled"}`)
        .setDescription("MFA has been toggled")
        .setColor("#2b2d31")
        .addFields({
            name: "Username",
            value: user.username,
            inline: true
        }, {
            name: "Email",
            value: user.email,
            inline: true
        }, {
            name: "Account ID",
            value: user.accountId
        })
        .setColor("2b2d31")
        .setFooter(footer)
        .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
}
 
