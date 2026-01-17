const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('View detailed information about a server')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('Server name or slug')
                .setRequired(true)
                .setAutocomplete(true)),
    async autocomplete(interaction) {
        try {
            const focusedValue = interaction.options.getFocused();
            const servers = await interaction.client.Server.find({
                disabled: { $ne: true },
                $or: [
                    { name: { $regex: focusedValue, $options: 'i' } },
                    { slug: { $regex: focusedValue, $options: 'i' } }
                ]
            }).limit(15).lean();

            await interaction.respond(
                servers.map(server => ({ name: `${server.name} (${server.slug})`, value: server.slug }))
            );
        } catch (error) {
            console.error('Error in serverinfo autocomplete:', error);
            await interaction.respond([]).catch(() => {});
        }
    },
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

            const serverInput = interaction.options.getString('server');
            
            // Find server by slug or name
            let server = await interaction.client.Server.findOne({ slug: serverInput });
            
            if (!server) {
                // Try finding by name if slug doesn't match
                server = await interaction.client.Server.findOne({ 
                    name: { $regex: new RegExp(`^${serverInput}$`, 'i') }
                });
            }

            if (!server) {
                return interaction.editReply({ 
                    content: `Server "${serverInput}" not found. Use autocomplete to see available servers.` 
                });
            }

            // Use database status (synced every 5 minutes)
            const status = {
                online: server.online || false,
                players: {
                    online: server.players || 0,
                    max: server.maxPlayers || 0
                },
                motd: null
            };

            // Build the embed
            const embed = new EmbedBuilder()
                .setTitle(`${server.name}`)
                .setDescription(server.description || 'No description available')
                .setColor(status.online ? '#00FF00' : '#FF0000')
                .setTimestamp();

            // Add server icon/image
            if (server.server_icon) {
                // For data URIs, we can't use them in Discord embeds
                // So we'll add them as an image URL in the embed if it's a valid URL
                if (server.server_icon.startsWith('http://') || server.server_icon.startsWith('https://')) {
                    embed.setThumbnail(server.server_icon);
                }
            } else if (server.image) {
                embed.setThumbnail(server.image);
            }

            // Server Status
            const statusEmoji = status.online ? '🟢 Online' : '🔴 Offline';
            const playerInfo = status.online 
                ? `${status.players.online}/${status.players.max}` 
                : 'N/A';

            embed.addFields({
                name: '📊 Server Status',
                value: [
                    `**Status:** ${statusEmoji}`,
                    `**Players:** ${playerInfo}`,
                    `**Votes:** ${server.vote || 0}`
                ].join('\n'),
                inline: false
            });

            // Connection Info
            const connectionInfo = [
                `**Java IP:** \`${server.ip}:${server.port}\``,
                `**Type:** ${server.server_type || 'Unknown'}`
            ];

            if (server.bedrock_ip) {
                connectionInfo.push(`**Bedrock IP:** \`${server.bedrock_ip}${server.bedrock_port ? ':' + server.bedrock_port : ''}\``);
            }

            embed.addFields({
                name: '🔌 Connection',
                value: connectionInfo.join('\n'),
                inline: false
            });

            // Gamemodes
            if (server.gamemodes && server.gamemodes.length > 0) {
                embed.addFields({
                    name: '🎮 Gamemodes',
                    value: server.gamemodes.join(', '),
                    inline: false
                });
            }

            // MOTD (Message of the Day)
            if (status.motd) {
                const motdText = status.motd.length > 200 
                    ? status.motd.substring(0, 197) + '...' 
                    : status.motd;
                embed.addFields({
                    name: '💬 MOTD',
                    value: `\`\`\`${motdText}\`\`\``,
                    inline: false
                });
            }

            // Additional Info
            if (server.content && server.content !== server.description) {
                const contentText = server.content.length > 300 
                    ? server.content.substring(0, 297) + '...' 
                    : server.content;
                embed.addFields({
                    name: '📝 Details',
                    value: contentText,
                    inline: false
                });
            }

            // Links
            const links = [];
            if (server.website) links.push(`[Website](${server.website})`);
            if (server.discord) links.push(`[Discord](${server.discord})`);
            if (server.youtube) links.push(`[YouTube](${server.youtube})`);

            if (links.length > 0) {
                embed.addFields({
                    name: '🔗 Links',
                    value: links.join(' • '),
                    inline: false
                });
            }

            // Footer info
            const footerParts = [];
            if (server.featured) footerParts.push('⭐ Featured Server');
            if (server.disabled) footerParts.push('❌ Currently Disabled');
            footerParts.push(`Slug: ${server.slug}`);

            embed.setFooter({ text: footerParts.join(' • ') });

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in serverinfo command:', error);
            
            const errorMessage = 'An error occurred while fetching server information.';
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
