const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the rankings leaderboard')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The gamemode to show rankings for (optional)')
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
            await interaction.deferReply();
            
            const gamemode = interaction.options.getString('gamemode');
        const { normalizeGamemodeName } = require('../../utils/helpers');
        const gmKey = gamemode ? normalizeGamemodeName(gamemode) : null;

        let usersInfo;
        if (gmKey) {
            // Fetch users with ranks in the specified gamemode, sorted by rank
            usersInfo = await interaction.client.UserInfo.find({ 
                [`ranks.${gmKey}`]: { $exists: true } 
            }).lean();
        } else {
            // Fetch all users with any ranks
            usersInfo = await interaction.client.UserInfo.find({ 
                'ranks': { $exists: true, $ne: {} } 
            }).lean();
        }

        if (usersInfo.length === 0) {
            return interaction.editReply({
                content: `No rankings recorded for ${gamemode ? `the ${gamemode} gamemode` : 'any gamemode'}.`
            });
        }

        // Define rank tiers in order from highest to lowest
        const rankOrder = [
            'HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 
            'HT4', 'LT4', 'HT5', 'LT5', 'Unranked'
        ];

        // Sort users by their rank
        usersInfo.sort((a, b) => {
            let rankA = 'Unranked';
            let rankB = 'Unranked';

            if (gmKey) {
                rankA = a.ranks?.[gmKey]?.current || 'Unranked';
                rankB = b.ranks?.[gmKey]?.current || 'Unranked';
            } else {
                // For overall, find their highest rank across all gamemodes
                const aRanks = Object.values(a.ranks || {}).map(r => r.current);
                const bRanks = Object.values(b.ranks || {}).map(r => r.current);
                
                for (const rank of rankOrder) {
                    if (aRanks.includes(rank)) {
                        rankA = rank;
                        break;
                    }
                }
                for (const rank of rankOrder) {
                    if (bRanks.includes(rank)) {
                        rankB = rank;
                        break;
                    }
                }
            }

            const indexA = rankOrder.indexOf(rankA);
            const indexB = rankOrder.indexOf(rankB);
            
            return (indexA === -1 ? rankOrder.length : indexA) - 
                   (indexB === -1 ? rankOrder.length : indexB);
        });

        const embed = new EmbedBuilder()
            .setTitle(`Rankings Leaderboard ${gamemode ? `(${gamemode})` : '(Overall)'}`)
            .setColor('#FFD700')
            .setTimestamp();

        let description = '';
        let count = 0;
        const maxDisplay = 25; // Discord embed field limits

        for (const user of usersInfo) {
            if (count >= maxDisplay) break;

            try {
                const discordUser = await interaction.client.users.fetch(user.discordId).catch(() => null);
                if (!discordUser) continue;

                let rank = 'Unranked';
                let points = 0;

                if (gmKey) {
                    rank = user.ranks?.[gmKey]?.current || 'Unranked';
                    points = user.points?.[gmKey] || 0;
                } else {
                    // For overall, show their highest rank and total points
                    const userRanks = Object.values(user.ranks || {}).map(r => r.current);
                    for (const r of rankOrder) {
                        if (userRanks.includes(r)) {
                            rank = r;
                            break;
                        }
                    }
                    // Calculate total points
                    for (const [mode, pts] of Object.entries(user.points || {})) {
                        points += pts;
                    }
                }

                const medal = count === 0 ? '🥇' : count === 1 ? '🥈' : count === 2 ? '🥉' : `${count + 1}.`;
                description += `${medal} **${discordUser.username}** - ${rank} (${points} pts)\n`;
                count++;
            } catch (error) {
                console.error(`Error fetching user ${user.discordId}:`, error);
                continue;
            }
        }

        if (description === '') {
            description = 'No users found with rankings.';
        }

        embed.setDescription(description);
        embed.setFooter({ text: `Total ranked players: ${count}` });

        await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            
            const errorMessage = 'An error occurred while fetching the leaderboard.';
            try {
                if (interaction.deferred) {
                    await interaction.editReply({ content: errorMessage });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: errorMessage, flags: 64 });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    },
};
