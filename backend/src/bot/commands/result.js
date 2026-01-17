const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('result')
        .setDescription('Post test result')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user who took the test')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The gamemode of the test')
                .setRequired(true)
                .addChoices(
                    { name: 'Vanilla', value: 'Vanilla' },
                    { name: 'UHC', value: 'UHC' },
                    { name: 'Pot', value: 'Pot' },
                    { name: 'NethPot', value: 'NethPot' },
                    { name: 'SMP', value: 'SMP' },
                    { name: 'Sword', value: 'Sword' },
                    { name: 'Axe', value: 'Axe' },
                    { name: 'Mace', value: 'Mace' }
                ))
        .addStringOption(option =>
            option.setName('rank_earned')
                .setDescription('The rank earned by the user')
                .setRequired(true)
                .addChoices(
                    { name: 'HT1', value: 'HT1' },
                    { name: 'LT1', value: 'LT1' },
                    { name: 'HT2', value: 'HT2' },
                    { name: 'LT2', value: 'LT2' },
                    { name: 'HT3', value: 'HT3' },
                    { name: 'LT3', value: 'LT3' },
                    { name: 'HT4', value: 'HT4' },
                    { name: 'LT4', value: 'LT4' },
                    { name: 'HT5', value: 'HT5' },
                    { name: 'LT5', value: 'LT5' }
                ))
        .addIntegerOption(option =>
            option.setName('points')
                .setDescription('Points to award')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('tester1')
                .setDescription('Tester 1')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('tester2')
                .setDescription('Tester 2')
                .setRequired(false))
        .addUserOption(option =>
            option.setName('tester3')
                .setDescription('Tester 3')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const gamemode = interaction.options.getString('gamemode');
        const rankEarned = interaction.options.getString('rank_earned');
        const points = interaction.options.getInteger('points');
        const tester1 = interaction.options.getUser('tester1');
        const tester2 = interaction.options.getUser('tester2');
        const tester3 = interaction.options.getUser('tester3');

        await interaction.deferReply({ flags: 64 });

        const actualTesters = [tester1, tester2, tester3].filter(t => t);

        if (actualTesters.length === 0) {
            return interaction.editReply({ content: 'At least one tester must be provided.', flags: 64 });
        }

        let userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

        if (!userInfo) {
            return interaction.editReply({ content: 'User not found in the database. They need to register first.', flags: 64 });
        }

        try {
            // Handle automatic rank transition
            let currentRankData = userInfo.ranks.get(gamemode);
            if (currentRankData) {
                currentRankData.previous = currentRankData.current;
                currentRankData.current = rankEarned;
            } else {
                currentRankData = { current: rankEarned, previous: 'Unranked' };
            }
            userInfo.ranks.set(gamemode, currentRankData);

            // Add points
            if (!userInfo.points.has(gamemode)) {
                userInfo.points.set(gamemode, 0);
            }
            const currentPoints = userInfo.points.get(gamemode);
            const newPoints = currentPoints + points;
            userInfo.points.set(gamemode, newPoints);

            await userInfo.save();

            const { minecraftName, province, city } = userInfo;
            const finalRankData = userInfo.ranks.get(gamemode);
            const avatarUrl = `https://render.crafty.gg/3d/bust/${minecraftName}`;

            // Get tester IGNs (Minecraft names) for public display
            const testerPromises = actualTesters.map(async (tester) => {
                let testerIGN = tester.username;
                try {
                    const testerInfo = await interaction.client.UserInfo.findOne({ discordId: tester.id });
                    if (testerInfo && testerInfo.minecraftName) {
                        testerIGN = testerInfo.minecraftName;
                    }
                } catch (error) {
                    console.error('Error fetching tester info:', error);
                }
                return testerIGN;
            });

            const testerIGNs = await Promise.all(testerPromises);

            const testersValue = testerIGNs.join(', ');
            const testerPings = actualTesters.map(t => `<@${t.id}>`).join(', ');

            const embed = new EmbedBuilder()
                .setTitle(`${minecraftName}'s Test Results 🏆`)
                .setThumbnail(avatarUrl)
                .addFields(
                    { name: "Gamemode", value: gamemode, inline: true },
                    { name: "Testers", value: testersValue, inline: true },
                    { name: "Province", value: province || 'Not Set', inline: true },
                    { name: "City", value: city || 'Not Set', inline: true },
                    { name: "Previous Rank", value: finalRankData.previous, inline: true },
                    { name: "Current Rank", value: finalRankData.current, inline: true }
                );

            // Use resultChannelId from config for official result
            const targetChannelId = interaction.client.config.resultChannelId;
            if (!targetChannelId) {
                return interaction.editReply({ content: 'Result channel is not configured.', flags: 64 });
            }

            const targetChannel = await interaction.client.channels.fetch(targetChannelId).catch(() => null);

            if (targetChannel) {
                await targetChannel.send({ embeds: [embed] });
                await interaction.editReply({ content: `Test results sent to <#${targetChannelId}>. Awarded ${points} points.`, flags: 64 });
            } else {
                return interaction.editReply({ content: 'Could not find the target channel to send results.', flags: 64 });
            }

            // Log detailed info to resultChannelLogId
            const resultLogChannelId = interaction.client.config.resultChannelLogId;
            if (resultLogChannelId) {
                const resultLogChannel = await interaction.client.channels.fetch(resultLogChannelId).catch(() => null);
                if (resultLogChannel) {
                    const locationValue = (province && city) ? `${province}, ${city}` : (province || city || 'Not Set');
                    const resultLogEmbed = new EmbedBuilder()
                        .setTitle('Test Result Posted')
                        .setDescription(`**User:** <@${user.id}> (${minecraftName})\n**Gamemode:** ${gamemode}\n**Previous Rank:** ${finalRankData.previous}\n**New Rank:** ${finalRankData.current}\n**Points Awarded:** ${points} (New Total: ${newPoints})`)
                        .addFields(
                            { name: 'Tester(s)', value: testerPings, inline: true },
                            { name: 'Location', value: locationValue, inline: true },
                            { name: 'Posted In', value: `<#${targetChannelId}>`, inline: true }
                        )
                        .setColor('#00FFFF')
                        .setTimestamp();
                    await resultLogChannel.send({ embeds: [resultLogEmbed] });
                }
            }

            // Log rank update to rankUpdatedChannelId
            const logChannelId = interaction.client.config.rankUpdatedChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const locationValue = (province && city) ? `${province}, ${city}` : (province || city || 'Not Set');
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Rank Updated via Test Result')
                        .setDescription(`**User:** <@${user.id}> (${minecraftName})\n**Gamemode:** ${gamemode}\n**Previous Rank:** ${finalRankData.previous}\n**New Rank:** ${finalRankData.current}`)
                        .addFields(
                            { name: 'Tester(s)', value: testerPings, inline: true },
                            { name: 'Location', value: locationValue, inline: true }
                        )
                        .setColor('#00FF00')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            // Log points to pointsUpdateChannelId
            const pointsLogChannelId = interaction.client.config.pointsUpdateChannelId;
            if (pointsLogChannelId) {
                const pointsLogChannel = await interaction.client.channels.fetch(pointsLogChannelId).catch(() => null);
                if (pointsLogChannel) {
                    const pointsEmbed = new EmbedBuilder()
                        .setTitle('Points Awarded via Result')
                        .setDescription(`Awarded ${points} points in ${gamemode} to ${minecraftName}. New total: ${newPoints}.`)
                        .addFields(
                            { name: 'Tester(s)', value: testerPings, inline: true },
                            { name: 'User', value: `<@${user.id}>`, inline: true },
                            { name: 'Gamemode', value: gamemode, inline: true }
                        )
                        .setColor('#FFFF00')
                        .setTimestamp();
                    await pointsLogChannel.send({ embeds: [pointsEmbed] });
                }
            }
        } catch (error) {
            console.error('Error in result command:', error);
            try {
                if (interaction.deferred && !interaction.replied) {
                    await interaction.editReply({ content: 'An error occurred while processing the test result.', flags: 64 });
                } else if (!interaction.replied) {
                    await interaction.reply({ content: 'An error occurred while processing the test result.', flags: 64 });
                }
            } catch (replyError) {
                console.error('Failed to send error message:', replyError);
            }
        }
    },
};