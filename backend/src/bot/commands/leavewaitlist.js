const { SlashCommandBuilder } = require('discord.js');
const Waitlist = require('../../models/waitlist');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leavewaitlist')
        .setDescription('Leaves a waitlist.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('gamemode')
                .setDescription('Leaves a specific gamemode waitlist.')
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The game mode of the waitlist to leave.')
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
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Leaves all waitlists.')),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        try {
            if (subcommand === 'gamemode') {
                const gamemode = interaction.options.getString('gamemode');
                const waitlist = await Waitlist.findOne({ gamemode: gamemode });

                if (!waitlist) {
                    await interaction.editReply({ content: `No active waitlist found for ${gamemode}.` });
                    return;
                }

                const userIndex = waitlist.usersInWaitlist.indexOf(userId);

                if (userIndex > -1) {
                    waitlist.usersInWaitlist.splice(userIndex, 1);
                    await waitlist.save();
                    await interaction.editReply({ content: `You have successfully left the ${gamemode} waitlist.` });
                } else {
                    await interaction.editReply({ content: `You are not currently in the ${gamemode} waitlist.` });
                }
            } else if (subcommand === 'all') {
                const waitlists = await Waitlist.find({ usersInWaitlist: userId });

                if (waitlists.length === 0) {
                    await interaction.editReply({ content: 'You are not in any waitlists.' });
                    return;
                }

                for (const waitlist of waitlists) {
                    const userIndex = waitlist.usersInWaitlist.indexOf(userId);
                    if (userIndex > -1) {
                        waitlist.usersInWaitlist.splice(userIndex, 1);
                        await waitlist.save();
                    }
                }

                await interaction.editReply({ content: 'You have successfully left all waitlists.' });
            }
        } catch (error) {
            console.error('Error leaving waitlist:', error);
            await interaction.editReply({ content: 'An error occurred while trying to leave the waitlist.' });
        }
    },
};

