const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle, ChannelType } = require('discord.js');
const WaitlistSettings = require('../../models/waitlistSettings');
const Waitlist = require('../../models/waitlist');

const gamemodeEmojis = {
    'Vanilla': '🍦',
    'UHC': '❤️',
    'Pot': '🧪',
    'NethPot': '🌋',
    'SMP': '🏡',
    'Sword': '⚔️',
    'Axe': '🪓',
    'Mace': '🔨',
};

const gamemodes = ['Vanilla', 'UHC', 'Pot', 'NethPot', 'SMP', 'Sword', 'Axe', 'Mace'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupwaitlist')
        .setDescription('Sets up the waitlist message in a specific channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to send the waitlist message to.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
        }

        const channel = interaction.options.getChannel('channel');

        const embed = new EmbedBuilder()
            .setTitle('Tiertest Waitlists')
            .setDescription('Welcome to the MineNepal Tiertest Waitlists! Join a gamemode waitlist by clicking its button below. Testers will claim you when they are ready. Good luck!')
            .setColor('#00FF00')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: `Last updated: ${new Date().toLocaleString()}` });

        const allWaitlists = await interaction.client.Waitlist.find({ disabled: false });
        allWaitlists.forEach(waitlist => {
            const userList = waitlist.usersInWaitlist.map((user, index) => `${index + 1}. <@${user}>`).join("\n") || "No users currently in waitlist.";
            const testerList = waitlist.testerID ? waitlist.testerID.split(', ').map(id => `<@${id}>`).join(', ') : 'No active testers.';
            embed.addFields(
                { name: `__${waitlist.gamemode}__`, value: `Users:\n${userList}\n\nTesters: ${testerList}`, inline: false }
            );
        });

        // Get enabled gamemodes from the database
        const enabledWaitlists = await interaction.client.Waitlist.find({ disabled: false });
        const enabledGamemodes = enabledWaitlists.map(w => w.gamemode);

        const rows = [];
        for (let i = 0; i < enabledGamemodes.length; i += 4) {
            const row = new ActionRowBuilder();
            for (let j = i; j < i + 4 && j < enabledGamemodes.length; j++) {
                const gamemode = enabledGamemodes[j];
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`joinWaitlist-${gamemode}`)
                        .setLabel(`${gamemodeEmojis[gamemode]} ${gamemode}`)
                        .setStyle(ButtonStyle.Primary),
                );
            }
            rows.push(row);
        }

        try {
            const message = await channel.send({ embeds: [embed], components: rows });

            await WaitlistSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { messageId: message.id, channelId: channel.id, guildId: interaction.guild.id },
                { upsert: true, new: true }
            );

            for (const gamemode of gamemodes) {
                await Waitlist.findOneAndUpdate(
                    { gamemode: gamemode },
                    { gamemode: gamemode },
                    { upsert: true, new: true }
                );
            }

            await interaction.reply({ content: `Waitlist message has been set up in <#${channel.id}>.`, flags: 64 });

        } catch (error) {
            console.error('Error setting up waitlist:', error);
            await interaction.reply({ content: 'An error occurred while setting up the waitlist.', flags: 64 });
        }
    },
};
