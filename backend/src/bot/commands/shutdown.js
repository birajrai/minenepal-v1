const { SlashCommandBuilder } = require('discord.js');

const ALLOWED_USER_ID = '835126233455919164';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shutdown')
        .setDescription('Shuts down the bot. Only usable by a specific user.'),
    async execute(interaction) {
        if (interaction.user.id !== ALLOWED_USER_ID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        await interaction.reply({ content: 'Shutting down bot...', flags: 64 });

        // Disconnect the bot
        interaction.client.destroy();

        // Exit the process after a short delay to allow the reply to be sent
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    },
};