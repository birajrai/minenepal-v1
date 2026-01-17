const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tiertest')
        .setDescription('Claims a user for a tiertest, removes them from waitlist, and creates a channel.')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The game mode of the waitlist to remove from.')
                .setRequired(true)
                .addChoices(
                    { name: 'Vanilla', value: 'Vanilla' },
                    { name: 'UHC', value: 'UHC' },
                    { name: 'Pot', value: 'Pot' },
                    { name: 'NethPot', value: 'NethPot' },
                    { name: 'SMP', value: 'SMP' },
                    { name: 'Sword', value: 'Sword' },
                    { name: 'Axe', value: 'Axe' },
                    { name: 'Mace', value: 'Mace' },
                ))
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to test.')
                .setRequired(true)),
    async execute(interaction) {
        const gamemode = interaction.options.getString('gamemode');
        const user = interaction.options.getUser('user');
        const config = interaction.client.config;

        // Check for Tester Role or Admin
        const testerRoleId = config.tiertesterRoleID;
        if (!interaction.member.roles.cache.has(testerRoleId) && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        await interaction.deferReply({ flags: 64 });

        try {
            // 1. Remove from Waitlist
            const waitlist = await interaction.client.Waitlist.findOne({ gamemode: gamemode });

            if (!waitlist || !waitlist.usersInWaitlist.includes(user.id)) {
                return interaction.editReply({ content: `User <@${user.id}> is not in the ${gamemode} waitlist.` });
            }

            const index = waitlist.usersInWaitlist.indexOf(user.id);
            waitlist.usersInWaitlist.splice(index, 1);

            // Add tester to testerID list if not present (optional tracking)
            if (waitlist.testerID) {
                const testers = waitlist.testerID.split(', ').filter(Boolean);
                if (!testers.includes(interaction.user.id)) {
                    testers.push(interaction.user.id);
                    waitlist.testerID = testers.join(', ');
                }
            } else {
                waitlist.testerID = interaction.user.id;
            }
            await waitlist.save();

            // 2. Create Channel
            const categoryId = config.tiertestCategory;
            const guild = interaction.guild;

            // Validate category
            const category = guild.channels.cache.get(categoryId);
            if (!category || category.type !== ChannelType.GuildCategory) {
                return interaction.editReply({ content: 'Tiertest category not found or invalid. Please check configuration.' });
            }

            // Sanitize username for channel name
            const sanitizedUsername = user.username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const channelName = `test-${sanitizedUsername}-${gamemode.toLowerCase()}`;

            const channel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: guild.id, // @everyone
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: interaction.user.id, // Tester
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    {
                        id: user.id, // User being tested
                        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                    },
                    // Add Tester Role permissions if needed, but specific tester is already added
                    {
                        id: testerRoleId,
                        allow: [PermissionsBitField.Flags.ViewChannel],
                    }
                ],
            });

            // 3. Send Message in Channel
            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`Tiertest: ${gamemode}`)
                .setDescription(`Welcome <@${user.id}>! Your tester is <@${interaction.user.id}>.\n\nGood luck with your test!`)
                .setColor('#00FF00')
                .setTimestamp();

            await channel.send({ content: `<@${user.id}> <@${interaction.user.id}>`, embeds: [welcomeEmbed] });

            // 4. Log to tiertestingLogChannelId
            const logChannelId = config.tiertestingLogChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Tiertest Started')
                        .setDescription(`**Tester:** <@${interaction.user.id}>\n**User:** <@${user.id}>\n**Gamemode:** ${gamemode}\n**Channel:** <#${channel.id}>`)
                        .setColor('#FFFF00')
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            const replyMessage = `Created tiertest channel <#${channel.id}> for <@${user.id}> in ${gamemode}. Removed user from waitlist.`;

            await interaction.editReply({ content: replyMessage });

        } catch (error) {
            console.error('Error in tiertest command:', error);
            await interaction.editReply({ content: 'An error occurred while setting up the tiertest.' });
        }
    },
};