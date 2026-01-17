const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupserverstatus')
        .setDescription('Create or configure the server status leaderboard message (saves channel & message IDs).')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to post the leaderboard in (defaults to this channel)')
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('Existing message ID to use instead of creating a new message')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const ServerStatusSettings = require('../../models/serverStatusSettings');

        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        // Determine target channel
        const channel = interaction.options.getChannel('channel') || interaction.channel;
        const providedMessageId = interaction.options.getString('messageid');

        if (!channel || channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please provide a text channel to post the leaderboard.', flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        try {
            let message;
            if (providedMessageId) {
                try {
                    message = await channel.messages.fetch(providedMessageId);
                    if (!message) throw new Error('Message not found');
                } catch (err) {
                    return interaction.editReply({ content: `Could not fetch message with ID ${providedMessageId} in that channel.`, flags: 64 });
                }
            } else {
                const placeholder = new EmbedBuilder()
                    .setTitle('Server Status Leaderboard')
                    .setDescription('Initializing server status leaderboard...')
                    .setTimestamp();

                message = await channel.send({ embeds: [placeholder] });
            }

            // Persist settings for this guild
            const guildId = interaction.guildId;
            await ServerStatusSettings.findOneAndUpdate(
                { guildId },
                { channelId: String(channel.id), messageId: String(message.id), guildId },
                { upsert: true, new: true }
            );

            return interaction.editReply({ content: `Server status leaderboard saved to <#${channel.id}> (message ID: ${message.id}). I will update this message periodically.`, flags: 64 });
        } catch (err) {
            console.error('Error in setupserverstatusleaderboardpinging:', err);
            return interaction.editReply({ content: 'An error occurred while setting up the leaderboard.', flags: 64 });
        }
    }
};
