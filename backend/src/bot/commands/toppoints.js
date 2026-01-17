const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('toppoints')
        .setDescription('Displays the top users by points')
        .addStringOption(option =>
            option.setName('gamemode')
                .setDescription('The gamemode to show top points for (optional)')
                .addChoices(
                    { name: 'Vanilla', value: 'Vanilla' },
                    { name: 'UHC', value: 'UHC' },
                    { name: 'Pot', value: 'Pot' },
                    { name: 'NethPot', value: 'NethPot' },
                    { name: 'SMP', value: 'SMP' },
                    { name: 'Sword', value: 'Sword' },
                    { name: 'Axe', value: 'Axe' },
                    { name: 'Mace', value: 'Mace' },
                )),
    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });
        const gamemode = interaction.options.getString('gamemode');
            const { normalizeGamemodeName } = require('../../utils/helpers');
            const gmKey = gamemode ? normalizeGamemodeName(gamemode) : null;

        let usersInfo;
            if (gmKey) {
                // Fetch users with points in the specified gamemode (normalized), sorted by points descending
                usersInfo = await interaction.client.UserInfo.find({ [`points.${gmKey}`]: { $exists: true } })
                    .sort({ [`points.${gmKey}`]: -1 })
                    .limit(10)
                    .lean();
        } else {
            // Fetch all users and calculate total points, then sort
            const allUsersInfo = await interaction.client.UserInfo.find({ 'points': { $ne: {} } }).lean();

            usersInfo = allUsersInfo.map(user => {
                let totalPoints = 0;
                for (const [mode, pts] of Object.entries(user.points || {})) {
                    totalPoints += pts;
                }
                return { ...user, totalPoints };
            }).sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, 10);
        }

        if (usersInfo.length === 0) {
            return interaction.editReply({
                content: `No points recorded for ${gamemode ? `the ${gamemode} gamemode` : 'any gamemode'}.`
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`Top Points ${gamemode ? `(${gamemode})` : '(Overall)'}`)
            .setColor('#0099ff');

        let description = '';
        for (let i = 0; i < usersInfo.length; i++) {
            const user = usersInfo[i];
            const discordUser = await interaction.client.users.fetch(user.discordId);
                const points = gmKey ? user.points[gmKey] : user.totalPoints;
                const rank = gmKey ? user.ranks?.[gmKey]?.current : user.ranks?.['overall']?.current;
            description += `${i + 1}. ${discordUser.username}: ${points} points${rank ? ` (Rank: ${rank})` : ''}\n`;
        }

        embed.setDescription(description);

        await interaction.editReply({ embeds: [embed] });
    },
};