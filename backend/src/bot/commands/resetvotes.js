const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resetvotes')
        .setDescription('Resets votes for servers (Owner Only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('server')
                .setDescription('Resets votes for a specific server')
                .addStringOption(option =>
                    option.setName('server')
                        .setDescription('The server to reset votes for')
                        .setRequired(true)
                        .setAutocomplete(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('all')
                .setDescription('Resets votes for ALL servers (DANGEROUS!)')),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const servers = await interaction.client.Server.find({
            $or: [
                { name: { $regex: focusedValue, $options: 'i' } },
                { slug: { $regex: focusedValue, $options: 'i' } }
            ]
        }).limit(25);

        await interaction.respond(
            servers.map(server => ({ name: `${server.name} (${server.vote} votes)`, value: server.slug }))
        );
    },
    async execute(interaction) {
        // Only bot owner can use this command
        if (interaction.user.id !== interaction.client.config.ownerId) {
            return interaction.reply({
                content: '❌ Only the bot owner can use this command.',
                flags: 64
            });
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'server') {
            const slug = interaction.options.getString('server');

            const server = await interaction.client.Server.findOne({ slug });

            if (!server) {
                return interaction.reply({
                    content: `Server with slug "${slug}" not found.`,
                    flags: 64
                });
            }

            // Store old vote count for logging
            const oldVotes = server.vote;

            // Reset votes
            server.vote = 0;
            await server.save();

            await interaction.reply({
                content: `✅ Successfully reset votes for **${server.name}** (was: ${oldVotes}, now: 0).`,
                flags: 64
            });

            // Log to voteAdminChannelId
            const logChannelId = interaction.client.config.voteAdminChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Votes Reset - Server')
                        .setDescription(`Votes reset for **${server.name}**`)
                        .addFields(
                            { name: 'Owner', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Server', value: server.name, inline: true },
                            { name: 'Previous Votes', value: oldVotes.toString(), inline: true }
                        )
                        .setColor('#FF0000')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }

        } else if (subcommand === 'all') {
            // Create confirmation buttons
            const confirmButton = new ButtonBuilder()
                .setCustomId('confirm_reset_all_votes')
                .setLabel('✅ CONFIRM RESET')
                .setStyle(ButtonStyle.Danger);

            const cancelButton = new ButtonBuilder()
                .setCustomId('cancel_reset_all_votes')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(confirmButton, cancelButton);

            const response = await interaction.reply({
                content: '⚠️ **DANGER**: This will permanently reset ALL votes for ALL servers!\n\nClick "CONFIRM RESET" to proceed or "Cancel" to abort.',
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

                if (confirmation.customId === 'confirm_reset_all_votes') {
                    await confirmation.deferUpdate();

                    // Get all servers with their vote counts
                    const servers = await interaction.client.Server.find({});
                    const totalVotes = servers.reduce((sum, server) => sum + server.vote, 0);

                    // Reset all votes
                    await interaction.client.Server.updateMany(
                        {},
                        { $set: { vote: 0 } }
                    );

                    await interaction.editReply({
                        content: `✅ Successfully reset votes for ${servers.length} servers (total votes reset: ${totalVotes}).`,
                        components: []
                    });

                    // Log to voteAdminChannelId
                    const logChannelId = interaction.client.config.voteAdminChannelId;
                    if (logChannelId) {
                        const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setTitle('Votes Reset - ALL SERVERS')
                                .setDescription(`⚠️ All votes have been reset for all servers!`)
                                .addFields(
                                    { name: 'Owner', value: `<@${interaction.user.id}>`, inline: true },
                                    { name: 'Servers Affected', value: servers.length.toString(), inline: true },
                                    { name: 'Total Votes Reset', value: totalVotes.toString(), inline: true }
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
