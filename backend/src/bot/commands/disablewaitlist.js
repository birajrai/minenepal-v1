const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('disablewaitlist')
        .setDescription('Disables a specific game mode waitlist.')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The game mode of the waitlist to disable.')
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
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "You do not have the required permissions.", flags: 64 });
        }

        const gamemode = interaction.options.getString('gamemode');
        const waitlist = await interaction.client.Waitlist.findOne({ gamemode: gamemode });

        if (!waitlist) {
            return interaction.reply({ content: `No waitlist found for ${gamemode}.`, flags: 64 });
        }

        if (waitlist.disabled) {
            return interaction.reply({ content: `${gamemode} waitlist is already disabled.`, flags: 64 });
        }

        // Disable the waitlist and clear users/testers
        waitlist.disabled = true;
        waitlist.usersInWaitlist = [];
        waitlist.testerID = '';
        await waitlist.save();

        await interaction.reply({ content: `${gamemode} waitlist has been disabled and cleared.`, flags: 64 });
    },
};
