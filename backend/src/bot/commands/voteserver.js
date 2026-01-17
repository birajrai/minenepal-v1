const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voteserver')
        .setDescription('Vote for a server')
        .addStringOption(option =>
            option.setName('server')
                .setDescription('The server to vote for')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        // Only show enabled servers for voting
        const servers = await interaction.client.Server.find({
            disabled: { $ne: true },
            $or: [
                { name: { $regex: focusedValue, $options: 'i' } },
                { slug: { $regex: focusedValue, $options: 'i' } }
            ]
        }).limit(25);

        await interaction.respond(
            servers.map(server => ({ name: `${server.name}`, value: server.slug }))
        );
    },
    async execute(interaction) {
        const slug = interaction.options.getString('server');
        const Server = interaction.client.Server;
        const UserInfo = interaction.client.UserInfo;
        const VerificationSettings = interaction.client.VerificationSettings;
        const VoteCooldown = require('../../models/voteCooldown');

        try {
            // 1. Verification Check
            let userInfo = await UserInfo.findOne({ discordId: interaction.user.id });
            if (!userInfo || !userInfo.minecraftName) {
                const settings = await VerificationSettings.findOne({ guildId: interaction.guild.id });
                let msg = 'You must verify your Minecraft account before voting.';
                if (settings && settings.channelId) {
                    msg += ` Please go to <#${settings.channelId}> to verify.`;
                }
                return interaction.reply({ content: msg, flags: 64 });
            }

            // 2. Validate server exists
            const server = await Server.findOne({ slug, disabled: { $ne: true } });
            if (!server) {
                return interaction.reply({ content: 'Server not found or is disabled.', flags: 64 });
            }

            // 3. Cooldown Check (skip if user has bypass role)
            const bypassRoleId = interaction.client.config && interaction.client.config.VoteCDBypassId;
            const hasBypass = bypassRoleId ? interaction.member.roles.cache.has(bypassRoleId) : false;

            const now = Date.now();
            const cooldownMs = server.voteCooldownMs || 12 * 60 * 60 * 1000;

            // Check cooldown from VoteCooldown collection
            const cooldownDoc = await VoteCooldown.findOne({
                username: userInfo.minecraftName,
                serverSlug: slug
            }).collation({ locale: 'en', strength: 2 });

            if (cooldownDoc && !hasBypass) {
                const diff = now - cooldownDoc.lastVotedAt;

                if (diff < cooldownMs) {
                    const remaining = cooldownMs - diff;
                    const hours = Math.floor(remaining / (1000 * 60 * 60));
                    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
                    return interaction.reply({ content: `You have already voted for this server. Please wait ${hours}h ${minutes}m.`, flags: 64 });
                }

                // Update existing cooldown document
                cooldownDoc.lastVotedAt = now;
                await cooldownDoc.save();
            } else if (!cooldownDoc) {
                // Create new cooldown document
                await VoteCooldown.create({
                    username: userInfo.minecraftName,
                    serverSlug: slug,
                    lastVotedAt: now
                });
            }

            // Atomically increment vote count
            await Server.updateOne({ _id: server._id }, { $inc: { vote: 1 } });

            // Record the vote in Vote collection (for history)
            const Vote = require('../../models/vote');
            const newVote = new Vote({
                username: userInfo.minecraftName,
                server: server._id,
                serverSlug: slug,
                timestamp: new Date(now)
            });
            await newVote.save();

            const updated = await Server.findById(server._id).lean();
            const rewardsEnabled = !!server.votingRewardEnabled && !!(server.secret && server.secret.trim() !== '');
            // Simplified message: no extra note when rewards disabled
            await interaction.reply({ content: `Successfully voted for **${server.name}** as **${userInfo.minecraftName}**! Total votes: ${updated.vote}` });

            // Send vote notification to Minecraft server via WebSocket
            try {
                // Only broadcast to reward system if rewards are enabled and secret configured
                if (rewardsEnabled) {
                    const webServer = require('../../web');
                    const voteData = {
                        username: userInfo.minecraftName,
                        uuid: userInfo.minecraftUUID || null,
                        server: slug,
                        serverName: server.name,
                        time: Date.now(),
                        discordId: interaction.user.id,
                        discordUsername: interaction.user.username
                    };
                    webServer.broadcastVote(voteData);
                }
            } catch (wsError) {
                console.error('Failed to send vote via WebSocket:', wsError);
                // Don't fail the vote if WebSocket fails
            }

            // Log vote (if configured)
            const logChannelId = interaction.client.config.voteLogChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const { EmbedBuilder } = require('discord.js');
                    const embed = new EmbedBuilder()
                        .setTitle('Server Vote')
                        .setDescription(`**User:** <@${interaction.user.id}> (${userInfo.minecraftName})\n**Server:** ${server.name} (${slug})\n**Total Votes:** ${server.vote}`)
                        .setColor('#00FF00')
                        .setTimestamp();
                    await logChannel.send({ embeds: [embed] });
                }
            }

            // Log reward-enabled votes separately (only if rewards active)
            if (rewardsEnabled) {
                const rewardLogChannelId = interaction.client.config.voteRewardLogChannelId;
                if (rewardLogChannelId) {
                    const rewardChannel = await interaction.client.channels.fetch(rewardLogChannelId).catch(() => null);
                    if (rewardChannel) {
                        const { EmbedBuilder } = require('discord.js');
                        const rewardEmbed = new EmbedBuilder()
                            .setTitle('Vote Reward Triggered')
                            .setDescription(`**Player:** ${userInfo.minecraftName}\n**Discord:** <@${interaction.user.id}>\n**Server:** ${server.name} (${slug})\n**Reward Status:** Broadcast sent to Minecraft server`)
                            .setColor('#FFD700')
                            .setTimestamp();
                        await rewardChannel.send({ embeds: [rewardEmbed] });
                    }
                }
            }

        } catch (error) {
            console.error('Error in voteserver command:', error);
            await interaction.reply({ content: 'An error occurred while processing your vote.', flags: 64 });
        }
    }
};
