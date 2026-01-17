const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View user statistics')
        .addStringOption(option =>
            option.setName('user')
                .setDescription('Mention a user (@user) or provide Minecraft username')
                .setRequired(false)),
    async execute(interaction) {
        try {
            // Defer immediately to avoid timeout
            await interaction.deferReply();
            
            // Check if user has the communityMember role
            const config = interaction.client.config;
            if (!interaction.member.roles.cache.has(config.communityMember)) {
                return interaction.editReply({ 
                    content: 'You do not have permission to use this command. Required role: Community Member'
                });
            }

            const userInput = interaction.options.getString('user');
            let targetUserInfo = null;
            let targetDiscordUser = null;

            if (!userInput) {
                // Show stats for the command user
                targetUserInfo = await interaction.client.UserInfo.findOne({ 
                    discordId: interaction.user.id 
                });
                targetDiscordUser = interaction.user;
            } else {
                // Check if input is a mention (Discord ID format)
                const mentionMatch = userInput.match(/^<@!?(\d+)>$/);
                const idMatch = userInput.match(/^\d+$/);
                
                if (mentionMatch || idMatch) {
                    // It's a Discord user mention or ID
                    const userId = mentionMatch ? mentionMatch[1] : userInput;
                    try {
                        targetDiscordUser = await interaction.client.users.fetch(userId);
                        targetUserInfo = await interaction.client.UserInfo.findOne({ 
                            discordId: userId 
                        });
                    } catch (error) {
                        return interaction.editReply({ 
                            content: 'Could not find that Discord user.' 
                        });
                    }
                } else {
                    // Treat as Minecraft username
                    targetUserInfo = await interaction.client.UserInfo.findOne({ 
                        minecraftName: { $regex: new RegExp(`^${userInput}$`, 'i') }
                    });
                    
                    if (targetUserInfo) {
                        try {
                            targetDiscordUser = await interaction.client.users.fetch(targetUserInfo.discordId);
                        } catch (error) {
                            console.error('Error fetching Discord user:', error);
                        }
                    }
                }
            }

            if (!targetUserInfo) {
                return interaction.editReply({ 
                    content: `No statistics found for ${userInput ? `"${userInput}"` : 'you'}. ${userInput ? 'They may' : 'You may'} need to verify first using the verification system.` 
                });
            }

            // Get Minecraft avatar
            const minecraftName = targetUserInfo.minecraftName || 'Steve';
            const minecraftAvatar = `https://mc-heads.net/avatar/${minecraftName}/128`;

            // Build the stats embed
            const embed = new EmbedBuilder()
                .setTitle(`${minecraftName}'s Statistics`)
                .setColor('#00AAFF')
                .setThumbnail(minecraftAvatar)
                .setTimestamp();

            // Basic Info
            embed.addFields({
                name: '👤 Player Information',
                value: [
                    `**Minecraft Name:** ${targetUserInfo.minecraftName || 'N/A'}`,
                    `**Discord Username:** ${targetDiscordUser ? targetDiscordUser.username : 'Unknown'}`,
                    `**Province:** ${targetUserInfo.province || 'N/A'}`,
                    `**City:** ${targetUserInfo.city || 'N/A'}`
                ].join('\n'),
                inline: false
            });

            // Points breakdown with emojis in specific order
            const pointsObj = {};
            if (targetUserInfo.points && targetUserInfo.points instanceof Map) {
                for (const [key, value] of targetUserInfo.points.entries()) {
                    pointsObj[key] = value;
                }
            } else if (targetUserInfo.points && typeof targetUserInfo.points === 'object') {
                Object.assign(pointsObj, targetUserInfo.points);
            }
            
            const emojis = config.gamemodeEmojis;
            const { normalizeGamemodeName } = require('../../utils/helpers');
            
            // Define gamemode order with display names
            const gamemodeOrder = [
                { key: 'vanilla', display: 'Vanilla' },
                { key: 'uhc', display: 'UHC' },
                { key: 'pot', display: 'Pot' },
                { key: 'nethpot', display: 'NethPot' },
                { key: 'smp', display: 'SMP' },
                { key: 'sword', display: 'Sword' },
                { key: 'axe', display: 'Axe' },
                { key: 'mace', display: 'Mace' }
            ];
            
            // Calculate total points
            let totalPoints = 0;
            for (const points of Object.values(pointsObj)) {
                totalPoints += points;
            }
            
            const pointsLines = [];
            
            // Add overall first
            if (emojis.overall) {
                pointsLines.push(`<:overall:${emojis.overall}> **Overall:** ${totalPoints}`);
            } else {
                pointsLines.push(`🌐 **Overall:** ${totalPoints}`);
            }
            
            // Add gamemodes in order - check both normalized and original keys
            for (const gm of gamemodeOrder) {
                let points = 0;
                
                // Try to find points by checking multiple possible key formats
                const normalizedKey = normalizeGamemodeName(gm.display);
                points = pointsObj[normalizedKey] || pointsObj[gm.key] || pointsObj[gm.display] || 0;
                
                const emojiId = emojis[gm.key];
                
                if (emojiId) {
                    pointsLines.push(`<:${gm.key}:${emojiId}> **${gm.display}:** ${points}`);
                } else {
                    pointsLines.push(`⭐ **${gm.display}:** ${points}`);
                }
            }
            
            const pointsValue = pointsLines.join('\n');
            
            embed.addFields({
                name: '📊 Statistics',
                value: pointsValue.length > 1024 ? pointsLines.slice(0, 10).join('\n') : pointsValue,
                inline: false
            });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in stats command:', error);
            
            // Try to send error message
            const errorMessage = 'An error occurred while fetching statistics.';
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
