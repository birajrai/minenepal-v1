const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Manage servers (Admin only)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add a new server')
                .addStringOption(option => option.setName('name').setDescription('Server Name').setRequired(true))
                .addStringOption(option => option.setName('slug').setDescription('Server Slug (Unique)').setRequired(true))
                .addStringOption(option => option.setName('ip').setDescription('Server IP').setRequired(true))
                .addIntegerOption(option => option.setName('port').setDescription('Server Port').setRequired(true))
                .addStringOption(option => option.setName('description').setDescription('Server Description').setRequired(true))
                .addStringOption(option => option.setName('content').setDescription('Server Content/Details').setRequired(true))
                .addStringOption(option => option.setName('server_type').setDescription('Server Type (e.g., Java, Bedrock)').setRequired(true))
                .addStringOption(option => option.setName('image').setDescription('Server Image URL').setRequired(false))
                .addStringOption(option => option.setName('bedrock_ip').setDescription('Bedrock IP').setRequired(false))
                .addIntegerOption(option => option.setName('bedrock_port').setDescription('Bedrock Port').setRequired(false))
                .addStringOption(option => option.setName('website').setDescription('Website URL').setRequired(false))
                .addStringOption(option => option.setName('discord').setDescription('Discord Invite URL').setRequired(false))
                .addStringOption(option => option.setName('youtube').setDescription('YouTube Channel URL').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('edit')
                .setDescription('Edit an existing server')
                .addStringOption(option => option.setName('slug').setDescription('Server Slug to edit').setRequired(true).setAutocomplete(true))
                .addStringOption(option => option.setName('name').setDescription('New Name').setRequired(false))
                .addStringOption(option => option.setName('ip').setDescription('New IP').setRequired(false))
                .addIntegerOption(option => option.setName('port').setDescription('New Port').setRequired(false))
                .addStringOption(option => option.setName('description').setDescription('New Description').setRequired(false))
                .addStringOption(option => option.setName('content').setDescription('New Content').setRequired(false))
                .addStringOption(option => option.setName('server_type').setDescription('New Server Type').setRequired(false))
                .addStringOption(option => option.setName('image').setDescription('New Image URL').setRequired(false))
                .addStringOption(option => option.setName('bedrock_ip').setDescription('New Bedrock IP').setRequired(false))
                .addIntegerOption(option => option.setName('bedrock_port').setDescription('New Bedrock Port').setRequired(false))
                .addStringOption(option => option.setName('website').setDescription('New Website URL').setRequired(false))
                .addStringOption(option => option.setName('discord').setDescription('New Discord Invite URL').setRequired(false))
                .addStringOption(option => option.setName('youtube').setDescription('New YouTube Channel URL').setRequired(false))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove a server')
                .addStringOption(option => option.setName('slug').setDescription('Server Slug to remove').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('disable')
                .setDescription('Toggle server disabled status')
                .addStringOption(option => option.setName('slug').setDescription('Server Slug to toggle').setRequired(true).setAutocomplete(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('editvote')
                .setDescription('Set server votes')
                .addStringOption(option => option.setName('slug').setDescription('Server Slug').setRequired(true).setAutocomplete(true))
                .addIntegerOption(option => option.setName('count').setDescription('New Vote Count').setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all servers')
                .addIntegerOption(option =>
                    option
                        .setName('page')
                        .setDescription('Page number (default: 1)')
                        .setRequired(false)
                        .setMinValue(1)
                )
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const servers = await interaction.client.Server.find({
            $or: [
                { name: { $regex: focusedValue, $options: 'i' } },
                { slug: { $regex: focusedValue, $options: 'i' } }
            ]
        }).limit(25);

        await interaction.respond(
            servers.map(server => ({ name: `${server.name} (${server.slug})`, value: server.slug }))
        );
    },
    async execute(interaction) {
        // Fix: Use config for role ID instead of hardcoded value
        const allowedRoleId = interaction.client.config.roleID;
        if (!interaction.member.roles.cache.has(allowedRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const subcommand = interaction.options.getSubcommand();
        const Server = interaction.client.Server;

        try {
            let replyContent = '';
            if (subcommand === 'add') {
                const port = interaction.options.getInteger('port');
                const bedrockPort = interaction.options.getInteger('bedrock_port');

                // Validate ports
                if (port < 1 || port > 65535) {
                    return interaction.reply({ content: 'Invalid server port. Must be between 1 and 65535.', flags: 64 });
                }
                if (bedrockPort && (bedrockPort < 1 || bedrockPort > 65535)) {
                    return interaction.reply({ content: 'Invalid Bedrock port. Must be between 1 and 65535.', flags: 64 });
                }

                const newServer = new Server({
                    name: interaction.options.getString('name'),
                    slug: interaction.options.getString('slug'),
                    ip: interaction.options.getString('ip'),
                    port: port,
                    description: interaction.options.getString('description'),
                    content: interaction.options.getString('content'),
                    server_type: interaction.options.getString('server_type'),
                    vote: 0,
                    image: interaction.options.getString('image'),
                    bedrock_ip: interaction.options.getString('bedrock_ip'),
                    bedrock_port: bedrockPort,
                    website: interaction.options.getString('website'),
                    discord: interaction.options.getString('discord'),
                    youtube: interaction.options.getString('youtube')
                });

                try {
                    await newServer.save();
                    replyContent = `Server **${newServer.name}** added successfully!`;
                } catch (saveError) {
                    if (saveError.code === 11000) {
                        return interaction.reply({ content: 'A server with this slug already exists. Please use a unique slug.', flags: 64 });
                    }
                    throw saveError;
                }

            } else if (subcommand === 'edit') {
                const slug = interaction.options.getString('slug');
                const server = await Server.findOne({ slug });
                if (!server) return interaction.reply({ content: 'Server not found.', flags: 64 });

                const updates = {};
                if (interaction.options.getString('name')) updates.name = interaction.options.getString('name');
                if (interaction.options.getString('ip')) updates.ip = interaction.options.getString('ip');

                const port = interaction.options.getInteger('port');
                if (port) {
                    if (port < 1 || port > 65535) return interaction.reply({ content: 'Invalid server port.', flags: 64 });
                    updates.port = port;
                }

                if (interaction.options.getString('description')) updates.description = interaction.options.getString('description');
                if (interaction.options.getString('content')) updates.content = interaction.options.getString('content');
                if (interaction.options.getString('server_type')) updates.server_type = interaction.options.getString('server_type');
                if (interaction.options.getString('image')) updates.image = interaction.options.getString('image');
                if (interaction.options.getString('bedrock_ip')) updates.bedrock_ip = interaction.options.getString('bedrock_ip');
                if (interaction.options.getString('website')) updates.website = interaction.options.getString('website');
                if (interaction.options.getString('discord')) updates.discord = interaction.options.getString('discord');
                if (interaction.options.getString('youtube')) updates.youtube = interaction.options.getString('youtube');

                const bedrockPort = interaction.options.getInteger('bedrock_port');
                if (bedrockPort) {
                    if (bedrockPort < 1 || bedrockPort > 65535) return interaction.reply({ content: 'Invalid Bedrock port.', flags: 64 });
                    updates.bedrock_port = bedrockPort;
                }

                Object.assign(server, updates);
                await server.save();
                replyContent = `Server **${server.name}** updated successfully!`;

            } else if (subcommand === 'remove') {
                const slug = interaction.options.getString('slug');
                const result = await Server.deleteOne({ slug });
                if (result.deletedCount === 0) return interaction.reply({ content: 'Server not found.', flags: 64 });
                replyContent = `Server with slug **${slug}** removed successfully.`;

            } else if (subcommand === 'disable') {
                const slug = interaction.options.getString('slug');
                const server = await Server.findOne({ slug });
                if (!server) return interaction.reply({ content: 'Server not found.', flags: 64 });

                server.disabled = !server.disabled;
                await server.save();
                replyContent = `Server **${server.name}** is now ${server.disabled ? 'disabled' : 'enabled'}.`;

            } else if (subcommand === 'editvote') {
                const slug = interaction.options.getString('slug');
                const count = interaction.options.getInteger('count');
                const server = await Server.findOne({ slug });
                if (!server) return interaction.reply({ content: 'Server not found.', flags: 64 });

                server.vote = count;
                await server.save();
                replyContent = `Votes for **${server.name}** set to ${count}.`;

            } else if (subcommand === 'list') {
                // Fetch only enabled servers with status from DB
                const servers = await Server.find({ disabled: { $ne: true } }).lean();
                if (servers.length === 0) return interaction.reply({ content: 'No servers found.' });

                // Pagination settings
                const SERVERS_PER_PAGE = 5;
                const page = interaction.options.getInteger('page') || 1;
                const totalPages = Math.ceil(servers.length / SERVERS_PER_PAGE);

                if (page > totalPages) {
                    return interaction.reply({ 
                        content: `Invalid page number. There are only ${totalPages} page${totalPages !== 1 ? 's' : ''}.`,
                        flags: 64 
                    });
                }

                // Use database status (synced every 5 minutes)
                const enrichedServers = servers.map(s => ({
                    name: s.name,
                    ip: s.ip,
                    port: s.port,
                    vote: s.vote,
                    online: s.online || false,
                    players: {
                        online: s.players || 0,
                        max: s.maxPlayers || 0
                    }
                }));

                // Sort by votes descending
                enrichedServers.sort((a, b) => b.vote - a.vote);

                // Get servers for current page
                const startIndex = (page - 1) * SERVERS_PER_PAGE;
                const endIndex = startIndex + SERVERS_PER_PAGE;
                const paginatedServers = enrichedServers.slice(startIndex, endIndex);

                // Build server list with clean formatting
                const serverList = paginatedServers.map((s, index) => {
                    const actualIndex = startIndex + index + 1;
                    const statusEmoji = s.online ? '🟢' : '🔴';
                    const playerInfo = s.online 
                        ? `\`${s.players.online}/${s.players.max}\` players` 
                        : '`Offline`';
                    
                    return `**${actualIndex}.** ${statusEmoji} **${s.name}**\n` +
                           `┣ 📍 **IP:** \`${s.ip}:${s.port}\`\n` +
                           `┣ 👥 **Players:** ${playerInfo}\n` +
                           `┗ 🎉 **Votes:** \`${s.vote}\``;
                }).join('\n\n');

                const embed = new EmbedBuilder()
                    .setTitle('🎮 MineNepal Servers')
                    .setDescription(serverList)
                    .setColor('#2B2D31')
                    .setTimestamp()
                    .setFooter({ 
                        text: `Page ${page}/${totalPages} • ${enrichedServers.length} Active Server${enrichedServers.length !== 1 ? 's' : ''}`
                    });

                await interaction.reply({ embeds: [embed] });
                return; // Don't set replyContent, we already replied with embed
            }

            // Only send regular reply if we haven't already replied (list command returns early)
            if (replyContent) {
                await interaction.reply({ content: replyContent });
            }

            // Log to appropriate channel based on action
            let logChannelId;
            if (subcommand === 'add') {
                logChannelId = interaction.client.config.serverAddLogChannelId;
            } else if (subcommand === 'remove') {
                logChannelId = interaction.client.config.serverRemoveChannelId;
            } else if (['edit', 'disable', 'editvote'].includes(subcommand)) {
                logChannelId = interaction.client.config.serverUpdateChannelId;
            }

            if (logChannelId && subcommand !== 'list') {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('Server Management Action')
                        .setDescription(replyContent)
                        .addFields(
                            { name: 'Admin', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Action', value: subcommand, inline: true }
                        )
                        .setColor('#FFA500')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('Error in server command:', error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: 'An error occurred while executing the command.', flags: 64 });
            } else {
                await interaction.followUp({ content: 'An error occurred while executing the command.', flags: 64 });
            }
        }
    }
};
