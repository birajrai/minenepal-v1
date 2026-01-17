const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupminecraftverification')
        .setDescription('Sets up the Minecraft verification message (Admin only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const VerificationSettings = interaction.client.VerificationSettings;

        const embed = new EmbedBuilder()
            .setTitle('Minecraft Account Verification')
            .setDescription('Click the button below to verify your Minecraft account. This is required for various server features including voting & tiertesting.')
            .setColor('#00FF00');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_minecraft')
                    .setLabel('Verify Minecraft Account')
                    .setStyle(ButtonStyle.Success)
            );

        const message = await interaction.channel.send({ embeds: [embed], components: [row] });

        await VerificationSettings.findOneAndUpdate(
            { guildId: interaction.guild.id },
            {
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: message.id
            },
            { upsert: true, new: true }
        );

        await interaction.reply({ content: 'Verification message setup successfully!', flags: 64 });

        // Log to generalLogChannelId
        const logChannelId = interaction.client.config.generalLogChannelId;
        if (logChannelId) {
            const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Verification Setup')
                    .setDescription(`Minecraft verification message has been set up by <@${interaction.user.id}>.`)
                    .addFields(
                        { name: 'Channel', value: `<#${interaction.channel.id}>`, inline: true },
                        { name: 'Message ID', value: message.id, inline: true }
                    )
                    .setColor('#00FF00')
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }
    },
};
