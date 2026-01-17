const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { normalizeGamemodeName } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('point')
        .setDescription('Manages user points (admin-only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Gives points to a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to give points to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of points to give')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode for points')
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
                .setName('remove')
                .setDescription('Removes points from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove points from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of points to remove')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode for points')
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
                .setName('set')
                .setDescription('Sets a user\'s points to a specific amount')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to set points for')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of points to set')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode for points')
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
                .setName('take')
                .setDescription('Takes points from a user (alias for remove)')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to take points from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('The amount of points to take')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode for points')
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
                        ))),
    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const user = interaction.options.getUser('user');
            const amount = interaction.options.getInteger('amount');
            const gamemode = interaction.options.getString('gamemode');
            const gmKey = normalizeGamemodeName(gamemode);

            // Validate amount is positive for give and set
            if ((subcommand === 'give' || subcommand === 'set') && amount <= 0) {
                return interaction.reply({
                    content: 'Amount must be a positive number.',
                    flags: 64
                });
            }

            // Validate amount is positive for remove/take
            if ((subcommand === 'remove' || subcommand === 'take') && amount <= 0) {
                return interaction.reply({
                    content: 'Amount must be a positive number.',
                    flags: 64
                });
            }

            let userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

            if (!userInfo) {
                // Create new user info if it doesn't exist
                userInfo = new interaction.client.UserInfo({
                    discordId: user.id,
                    minecraftName: 'N/A',
                    province: 'N/A',
                    city: 'N/A',
                    points: new Map()
                });
            }

            // Initialize gamemode points if not already present (use normalized key)
            if (!userInfo.points.has(gmKey)) {
                userInfo.points.set(gmKey, 0);
            }

            let replyContent = '';
            let currentPoints = userInfo.points.get(gmKey);

            switch (subcommand) {
                case 'give':
                    currentPoints += amount;
                    userInfo.points.set(gmKey, currentPoints);
                    replyContent = `Gave ${amount} points in ${gamemode} to ${user.username}. New total: ${currentPoints}.`;
                    break;
                case 'remove':
                case 'take':
                    currentPoints -= amount;
                    // Prevent negative points
                    if (currentPoints < 0) {
                        currentPoints = 0;
                    }
                    userInfo.points.set(gmKey, currentPoints);
                    replyContent = `Removed ${amount} points in ${gamemode} from ${user.username}. New total: ${currentPoints}.`;
                    break;
                case 'set':
                    userInfo.points.set(gmKey, amount);
                    replyContent = `Set ${user.username}'s ${gamemode} points to ${amount}.`;
                    break;
                default:
                    return interaction.reply({
                        content: 'Invalid subcommand.',
                        flags: 64
                    });
            }

            await userInfo.save();

            await interaction.reply({
                content: replyContent,
                flags: 64
            });

            // Log to pointsUpdateChannelId
            const logChannelId = interaction.client.config.pointsUpdateChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Points Update')
                        .setDescription(replyContent)
                        .addFields(
                            { name: 'Admin', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'User', value: `<@${user.id}>`, inline: true },
                            { name: 'Gamemode', value: gamemode, inline: true }
                        )
                        .setColor('#FFFF00')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error in point command:', error);
            await interaction.reply({ content: 'An error occurred while managing points.', flags: 64 }).catch(() => { });
        }
    },
};