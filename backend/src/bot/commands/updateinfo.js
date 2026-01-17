const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('updateinfo')
        .setDescription('Updates a user\'s Minecraft name, province, and city.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The Discord user whose info to update.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('minecraft_name')
                .setDescription('The user\'s Minecraft username.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('province')
                .setDescription('The user\'s province.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('city')
                .setDescription('The user\'s city.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const minecraftName = interaction.options.getString('minecraft_name');
        const province = interaction.options.getString('province');
        const city = interaction.options.getString('city');

        await interaction.reply({ content: 'Updating user info...', flags: 64 });

        try {
            await interaction.client.UserInfo.findOneAndUpdate(
                { discordId: user.id },
                { minecraftName: minecraftName, province: province, city: city },
                { upsert: true, new: true }
            );
            await interaction.editReply({ content: `Successfully updated info for ${user.username}.`, flags: 64 });

            // Log to accountUpdateChannelId
            const logChannelId = interaction.client.config.accountUpdateChannelId;
            if (logChannelId) {
                const logChannel = await interaction.client.channels.fetch(logChannelId).catch(() => null);
                if (logChannel) {
                    const embed = new EmbedBuilder()
                        .setTitle('User Info Updated')
                        .setDescription(`Information for ${user.username} has been updated by <@${interaction.user.id}>.`)
                        .addFields(
                            { name: 'Discord User', value: `<@${user.id}>`, inline: true },
                            { name: 'Minecraft Name', value: minecraftName, inline: true },
                            { name: 'Province', value: province, inline: true },
                            { name: 'City', value: city, inline: true }
                        )
                        .setColor('#00FF00')
                        .setTimestamp();

                    await logChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error updating user info:', error);
            await interaction.editReply({ content: 'There was an error while updating user info.', flags: 64 });
        }
    },
};