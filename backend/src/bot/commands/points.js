const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { normalizeGamemodeName } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('points')
        .setDescription('Displays a user\'s points and ranks.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check points and ranks for.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The gamemode to check points and ranks for (optional).')
                .addChoices(
                    { name: 'Vanilla', value: 'Vanilla' },
                    { name: 'UHC', value: 'UHC' },
                    { name: 'Pot', value: 'Pot' },
                    { name: 'NethPot', value: 'NethPot' },
                    { name: 'SMP', value: 'SMP' },
                    { name: 'Sword', value: 'Sword' },
                    { name: 'Axe', value: 'Axe' },
                    { name: 'Mace', value: 'Mace' },
                )),
    async execute(interaction) {
        try {
            await interaction.deferReply({ flags: 64 });
            const targetUser = interaction.options.getUser('user');
            const gamemode = interaction.options.getString('gamemode');

            const userInfo = await interaction.client.UserInfo.findOne({ discordId: targetUser.id });

            // Construct avatar URL
            const avatarUrl = userInfo?.minecraftName && userInfo.minecraftName !== 'N/A'
                ? `https://render.crafty.gg/3d/bust/${userInfo.minecraftName}`
                : targetUser.displayAvatarURL();

            const embed = new EmbedBuilder()
                .setTitle(`Points & Ranks for ${targetUser.username}`)
                .setThumbnail(avatarUrl)
                .setColor('#0099ff')
                .setFooter({ text: `Information last updated: ${new Date().toLocaleString()}` });

            if (!userInfo || (userInfo.points.size === 0 && !gamemode)) {
                embed.setDescription(`${targetUser.username} has no points or ranks recorded.`);
                return interaction.editReply({ embeds: [embed] });
            }

            if (gamemode) {
                const gmKey = normalizeGamemodeName(gamemode);
                const points = userInfo.points.get(gmKey) || 0;
                const rankData = userInfo.ranks.get(gmKey) || { current: 'Unranked', previous: 'N/A' };

                embed.addFields(
                    { name: `Points in ${gamemode}`, value: points.toString(), inline: true },
                    { name: `Rank in ${gamemode}`, value: `${rankData.current} (${rankData.previous})`, inline: true }
                );
            } else {
                let totalPoints = 0;
                let hasPointsOrRanks = false;

                // Iterate through all possible gamemodes to ensure consistent display
                const allGamemodes = ['Vanilla', 'UHC', 'Pot', 'NethPot', 'SMP', 'Sword', 'Axe', 'Mace'];
                for (const mode of allGamemodes) {
                    const gmKey = normalizeGamemodeName(mode);
                    const points = userInfo.points.get(gmKey) || 0;
                    const rankData = userInfo.ranks.get(gmKey) || { current: 'Unranked', previous: 'N/A' };

                    if (points > 0 || rankData.current !== 'Unranked') {
                        embed.addFields(
                            { name: `__${mode}__`, value: `Points: ${points}`, inline: true },
                            { name: 'Rank', value: `${rankData.current} (${rankData.previous})`, inline: true }
                        );
                        totalPoints += points;
                        hasPointsOrRanks = true;
                    }
                }

                if (!hasPointsOrRanks) {
                    embed.setDescription('No points or ranks recorded for any gamemode.');
                } else {
                    embed.setFooter({ text: `Total Points: ${totalPoints} | Last updated: ${new Date().toLocaleString()}` });
                }
            }

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in points command:', error);
            if (interaction.deferred && !interaction.replied) {
                await interaction.editReply({ content: 'An error occurred while fetching points.', flags: 64 });
            } else if (!interaction.replied) {
                await interaction.reply({ content: 'An error occurred while fetching points.', flags: 64 });
            }
        }
    },
};