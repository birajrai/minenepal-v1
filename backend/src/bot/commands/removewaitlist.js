const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const WaitlistSettings = require('../../models/waitlistSettings');
const Waitlist = require('../../models/waitlist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removewaitlist')
        .setDescription('Removes the waitlist setup and all associated data.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        try {
            const settings = await WaitlistSettings.findOne({ guildId: interaction.guild.id });

            if (settings) {
                try {
                    const channel = await interaction.client.channels.fetch(settings.channelId);
                    if (channel) {
                        const message = await channel.messages.fetch(settings.messageId);
                        if (message) {
                            await message.delete();
                        }
                    }
                } catch (error) {
                    console.error('Error deleting waitlist message:', error);
                    // Continue even if message deletion fails
                }

                await WaitlistSettings.deleteOne({ guildId: interaction.guild.id });
            }

            await Waitlist.deleteMany({});

            await interaction.reply({ content: 'The waitlist setup has been completely removed.', flags: 64 });

        } catch (error) {
            console.error('Error removing waitlist setup:', error);
            await interaction.reply({ content: 'An error occurred while removing the waitlist setup.', flags: 64 });
        }
    },
};
