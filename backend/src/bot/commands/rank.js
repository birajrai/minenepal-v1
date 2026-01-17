const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { normalizeGamemodeName } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Manages user ranks for specific gamemodes (Admin Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Sets a user\'s rank for a specific gamemode')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to set the rank for')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode for the rank')
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
                    option.setName('rank')
                        .setDescription('The rank to assign')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Removes a user\'s rank for a specific gamemode')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove the rank from')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('gamemode')
                        .setDescription('The gamemode to remove the rank from')
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
            const gamemode = interaction.options.getString('gamemode');
            const gmKey = normalizeGamemodeName(gamemode);

            let userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

            if (!userInfo) {
                // Create new user info if it doesn't exist
                userInfo = new interaction.client.UserInfo({
                    discordId: user.id,
                    minecraftName: 'N/A',
                    province: 'N/A',
                    city: 'N/A',
                    points: new Map(),
                    ranks: new Map()
                });
            }

            let replyContent = '';

            switch (subcommand) {
                case 'set':
                    const rank = interaction.options.getString('rank');
                    // Get existing rank to preserve history (use normalized key)
                    const existingRank = userInfo.ranks.get(gmKey);
                    const previousRank = existingRank?.current || 'N/A';

                    // Set rank with current and previous fields
                    userInfo.ranks.set(gmKey, {
                        current: rank,
                        previous: previousRank
                    });

                    replyContent = `Set ${user.username}'s rank in ${gamemode} to **${rank}**.`;
                    if (previousRank !== 'N/A') {
                        replyContent += ` (Previous: ${previousRank})`;
                    }
                    break;

                case 'remove':
                    if (userInfo.ranks.has(gmKey)) {
                        const removedRank = userInfo.ranks.get(gmKey);
                        userInfo.ranks.delete(gmKey);
                        replyContent = `Removed ${user.username}'s rank in ${gamemode} (was: ${removedRank?.current || 'Unknown'}).`;
                    } else {
                        replyContent = `${user.username} does not have a rank set for ${gamemode}.`;
                    }
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

            // Log to rankUpdatedChannelId
            const logChannelId = interaction.client.config.rankUpdatedChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Rank Update')
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
            console.error('Error in rank command:', error);
            await interaction.reply({ content: 'An error occurred while managing ranks.', flags: 64 }).catch(() => { });
        }
    },
};