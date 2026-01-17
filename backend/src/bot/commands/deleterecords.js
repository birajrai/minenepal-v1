const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleterecords')
        .setDescription('Completely deletes all data for a user (Owner Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user whose data will be permanently deleted')
                .setRequired(true)),
    async execute(interaction) {
        // Only bot owner can use this command
        if (interaction.user.id !== interaction.client.config.ownerId) {
            return interaction.reply({
                content: '❌ Only the bot owner can use this command.',
                flags: 64
            });
        }

        const user = interaction.options.getUser('user');

        const userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

        if (!userInfo) {
            return interaction.reply({
                content: `${user.username} has no data to delete.`,
                flags: 64
            });
        }

        // Create confirmation buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId('confirm_delete_user')
            .setLabel('✅ CONFIRM DELETE')
            .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel_delete_user')
            .setLabel('❌ Cancel')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder()
            .addComponents(confirmButton, cancelButton);

        // Prepare data summary for confirmation
        const pointsCount = userInfo.points.size;
        const ranksCount = userInfo.ranks.size;
        const minecraftName = userInfo.minecraftName || 'N/A';

        const response = await interaction.reply({
            content: `⚠️ **DANGER**: This will permanently delete ALL data for **${user.username}**!\n\n**Data to be deleted:**\n- Minecraft Name: ${minecraftName}\n- Points: ${pointsCount} gamemodes\n- Ranks: ${ranksCount} gamemodes\n- Province/City info\n- Vote history\n\nThis action **CANNOT BE UNDONE**!\n\nClick "CONFIRM DELETE" to proceed or "Cancel" to abort.`,
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

            if (confirmation.customId === 'confirm_delete_user') {
                await confirmation.deferUpdate();

                // Store data for logging before deletion
                const deletedData = {
                    discordId: userInfo.discordId,
                    minecraftName: userInfo.minecraftName,
                    province: userInfo.province,
                    city: userInfo.city,
                    pointsCount: userInfo.points.size,
                    ranksCount: userInfo.ranks.size
                };

                // Delete the user record
                await interaction.client.UserInfo.deleteOne({ discordId: user.id });

                await interaction.editReply({
                    content: `✅ Successfully deleted all data for ${user.username}.`,
                    components: []
                });

                // Log to accountUpdateChannelId
                const logChannelId = interaction.client.config.accountUpdateChannelId;
                if (logChannelId) {
                    const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle('User Records Deleted')
                            .setDescription(`⚠️ All data permanently deleted for <@${user.id}>`)
                            .addFields(
                                { name: 'Owner', value: `<@${interaction.user.id}>`, inline: true },
                                { name: 'User', value: `<@${user.id}>`, inline: true },
                                { name: 'Minecraft Name', value: deletedData.minecraftName || 'N/A', inline: true },
                                { name: 'Location', value: `${deletedData.province}, ${deletedData.city}`, inline: true },
                                { name: 'Points Deleted', value: `${deletedData.pointsCount} gamemodes`, inline: true },
                                { name: 'Ranks Deleted', value: `${deletedData.ranksCount} gamemodes`, inline: true }
                            )
                            .setColor('#FF0000')
                            .setTimestamp();
                        await logChannel.send({ embeds: [embed] });
                    }
                }
            } else {
                await confirmation.update({
                    content: '❌ Deletion cancelled.',
                    components: []
                });
            }

        } catch (error) {
            // Timeout
            await interaction.editReply({
                content: '❌ Deletion cancelled - confirmation timeout (30 seconds).',
                components: []
            });
        }
    },
};
