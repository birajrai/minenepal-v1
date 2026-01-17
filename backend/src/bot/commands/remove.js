const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Removes a user from the waitlist.')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The game mode of the waitlist to remove from.')
                .setRequired(true)
                .addChoices(
                    { name: 'Vanilla', value: 'Vanilla' },
                    { name: 'UHC', value: 'UHC' },
                    { name: 'Pot', value: 'Pot' },
                    { name: 'NethPot', value: 'NethPot' },
                    { name: 'SMP', value: 'SMP' },
                    { name: 'Sword', value: 'Sword' },
                    { name: 'Axe', value: 'Axe' },
                    { name: 'Mace', value: 'Mace' },
                ))
        .addStringOption(option =>
            option.setName('user')
                .setDescription('User to remove from waitlist.')
                .setRequired(true)),
    async execute(interaction) {
        if (!interaction.member.permissions.has("ADMINISTRATOR")) {
            return interaction.reply({ content: "You do not have the required permissions.", flags: 64 });
        }

        const gamemode = interaction.options.getString('gamemode');
        const userToRemove = interaction.options.getString('user');

        const waitlist = await interaction.client.Waitlist.findOne({ gamemode: gamemode });

        if (!waitlist) {
            return interaction.reply({ content: `No active waitlist found for ${gamemode}.`, flags: 64 });
        }

        const userIndex = waitlist.usersInWaitlist.indexOf(userToRemove);

        if (userIndex > -1) {
            waitlist.usersInWaitlist.splice(userIndex, 1);
            await waitlist.save();
            await interaction.reply({ content: `User ${userToRemove} successfully removed from the ${gamemode} waitlist.`, flags: 64 });
        } else {
            await interaction.reply({ content: `User ${userToRemove} is not in the ${gamemode} waitlist.`, flags: 64 });
        }
    },
};