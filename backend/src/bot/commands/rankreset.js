const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankreset')
        .setDescription('Resets ranks for users (Owner Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Resets all ranks for a specific user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to reset ranks for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Resets all ranks for ALL users (DANGEROUS!)')),
    async execute(interaction) {
        // Only bot owner can use this command
        if (interaction.user.id !== interaction.client.config.ownerId) {
            return interaction.reply({
                content: '❌ Only the bot owner can use this command.',
                flags: 64
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'user') {
            const user = interaction.options.getUser('user');

            const userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

            if (!userInfo) {
                return interaction.reply({
                    content: `${user.username} has no ranks to reset.`,
                    flags: 64
                });
            }

            // Store old ranks for logging
            const oldRanks = {};
            for (const [gamemode, rankData] of userInfo.ranks.entries()) {
                oldRanks[gamemode] = rankData.current;
            }

            // Reset all ranks
            userInfo.ranks.clear();
            await userInfo.save();

            await interaction.reply({
                content: `✅ Successfully reset all ranks for ${user.username}.`,
                flags: 64
            });

            // Log to accountUpdateChannelId
            const logChannelId = interaction.client.config.accountUpdateChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const ranksList = Object.entries(oldRanks)
                        .map(([mode, rank]) => `${mode}: ${rank}`)
                        .join('\n') || 'No ranks';

                    const embed = new EmbedBuilder()
                        .setTitle('Ranks Reset - User')
                        .setDescription(`All ranks reset for <@${user.id}>`)
                        .addFields(
                            { name: 'Owner', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'User', value: `<@${user.id}>`, inline: true },
                            { name: 'Previous Ranks', value: ranksList, inline: false }
                        )
                        .setColor('#FF0000')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }

        } else if (subcommand === 'all') {
            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_reset_all_ranks')
                .setLabel('✅ CONFIRM RESET')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_reset_all_ranks')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(confirmButton, cancelButton);

            const response = await interaction.reply({
                content: '⚠️ **DANGER**: This will permanently reset ALL ranks for ALL users!\n\nClick "CONFIRM RESET" to proceed or "Cancel" to abort.',
                components: [row],
                flags: 64
            });

            // Create a collector for button interactions
            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({
                    filter: collectorFilter,
                    time: 30000
                });

                if (confirmation.customId === 'confirm_reset_all_ranks') {
                    await confirmation.deferUpdate();

                    // Get count of users with ranks
                    const usersWithRanks = await interaction.client.UserInfo.find({
                        'ranks': { $ne: {} }
                    });

                    // Reset all ranks
                    await interaction.client.UserInfo.updateMany(
                        {},
                        { $set: { ranks: new Map() } }
                    );

                    await interaction.editReply({
                        content: `✅ Successfully reset ranks for ${usersWithRanks.length} users.`,
                        components: []
                    });

                    // Log to accountUpdateChannelId
                    const logChannelId = interaction.client.config.accountUpdateChannelId;
                    if (logChannelId) {
                        const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setTitle('Ranks Reset - ALL USERS')
                                .setDescription(`⚠️ All ranks have been reset for all users!`)
                                .addFields(
                                    { name: 'Owner', value: `<@${interaction.user.id}>`, inline: true },
                                    { name: 'Users Affected', value: usersWithRanks.length.toString(), inline: true }
                                )
                                .setColor('#FF0000')
                                .setTimestamp();
                            await logChannel.send({ embeds: [embed] });
                        }
                    }
                } else {
                    await confirmation.update({
                        content: '❌ Reset cancelled.',
                        components: []
                    });
                }

            } catch (error) {
                // Timeout
                await interaction.editReply({
                    content: '❌ Reset cancelled - confirmation timeout (30 seconds).',
                    components: []
                });
            }
        }
    },
};
