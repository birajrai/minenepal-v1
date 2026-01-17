const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whois')
        .setDescription('Displays a user\'s stored Minecraft and location information.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The Discord user to look up.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('user');

        const userInfo = await interaction.client.UserInfo.findOne({ discordId: user.id });

        if (!userInfo) {
            return interaction.reply({ content: `User ${user.username} does not have stored information.`, flags: 64 });
        }

        const avatarUrl = userInfo.minecraftName && userInfo.minecraftName !== 'N/A' 
            ? `https://render.crafty.gg/3d/bust/${userInfo.minecraftName}` 
            : targetUser.displayAvatarURL();

        const embed = new EmbedBuilder()
            .setTitle(`Whois: ${user.username}`)
            .setThumbnail(avatarUrl)
            .addFields(
                { name: 'Discord User', value: `<@${user.id}>`, inline: true },
                { name: 'Minecraft Name', value: userInfo.minecraftName, inline: true },
                { name: 'Province', value: userInfo.province, inline: true },
                { name: 'City', value: userInfo.city, inline: true },
                { name: 'First Joined', value: userInfo.createdAt ? userInfo.createdAt.toDateString() : 'N/A', inline: true },
                { name: 'Last Updated', value: userInfo.updatedAt ? userInfo.updatedAt.toDateString() : 'N/A', inline: true }
            )
            .setColor('#0099ff')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};