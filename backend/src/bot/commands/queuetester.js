const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queuetester')
        .setDescription('Adds testers to a specific game mode waitlist.')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The game mode to add testers to.')
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
        .addUserOption(option =>
            option.setName('tester1')
                .setDescription('The first tester to add.')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('tester2')
                .setDescription('The second tester to add.')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('tester3')
                .setDescription('The third tester to add.')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('tester4')
                .setDescription('The fourth tester to add.')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('tester5')
                .setDescription('The fifth tester to add.')
                .setRequired(false)),
    async execute(interaction) {
        // Fix: Use PermissionFlagsBits instead of deprecated string
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: "You do not have the required permissions.", flags: 64 });
        }

        try {
            const gamemode = interaction.options.getString('gamemode');
            const waitlist = await interaction.client.Waitlist.findOne({ gamemode: gamemode });

            if (!waitlist) {
                return interaction.reply({ content: `No active waitlist found for ${gamemode}.`, flags: 64 });
            }

            const testers = [];
            for (let i = 1; i <= 5; i++) {
                const tester = interaction.options.getUser(`tester${i}`);
                if (tester) {
                    testers.push(tester.id);
                }
            }

            waitlist.testerID = testers.join(', '); // Store multiple testers as a comma-separated string
            await waitlist.save();

            await interaction.reply({ content: `Testers ${testers.map(id => `<@${id}>`).join(', ')} added to the ${gamemode} waitlist.`, flags: 64 });

            // Log to tiertestingLogChannelId
            const logChannelId = interaction.client.config.tiertestingLogChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Testers Added to Waitlist')
                        .setDescription(`**Gamemode:** ${gamemode}\n**Testers:** ${testers.map(id => `<@${id}>`).join(', ')}`)
                        .addFields(
                            { name: 'Admin', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Gamemode', value: gamemode, inline: true }
                        )
                        .setColor('#00FFFF')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error in queuetester command:', error);
            await interaction.reply({ content: 'An error occurred while adding testers to the waitlist.', flags: 64 }).catch(() => { });
        }
    },
};