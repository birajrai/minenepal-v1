/**
 * Bot Configuration
 * 
 * This file contains all configuration settings for the Discord bot.
 * Make sure to keep this file secure and never commit it to version control.
*/
module.exports = {
    // Database
    mongoURI: '',
    // Discord Bot Settings
    token: '',
    clientId: '',

    // Server Settings
    guildId: '', // Primary guild (kept for backward compatibility)
    guildIds: [''], // Authorized guilds
    ownerId: '',

    // Role IDs
    roleID: '',
    tiertesterRoleID: '',
    verifiedRole: '',
    serverManager: '',
    rankingsManager: '',
    communityMember: '',

    // Channel IDs
    channelID: '',
    tiertestCategory: '',

    // Log Channel IDs
    accountVerifiedChannelId: '',
    accountUpdateChannelId: '',
    voteLogChannelId: '',
    voteAdminChannelId: '',
    serverAddLogChannelId: '',
    serverRemoveChannelId: '',
    serverUpdateChannelId: '',
    pointsUpdateChannelId: '',
    waitlistLogChannelId: '',
    tiertestingLogChannelId: '',
    resultChannelId: '',
    resultChannelLogId: '',
    rankUpdatedChannelId: '',
    voteRewardLogChannelId: '',

    // RoleID of Ranks
    HT1RoleId: '',
    LT1RoleId: '',
    HT2RoleId: '',
    LT2RoleId: '',
    HT3RoleId: '',
    LT3RoleId: '',
    HT4RoleId: '',
    LT4RoleId: '',
    HT5RoleId: '',
    LT5RoleId: '',

    // Admin Users (Double Password System)
    adminUsers: [
        {
            username: '',
            pass1: '',
            pass2: ''
        },
        {
            username: '',
            pass1: '',
            pass2: ''
        }
    ],

    // Session secret
    sessionSecret: '',

    // Cloudflare Turnstile
    turnstileSiteKey: '',
    turnstileSecretKey: '',

    // Gamemode Emoji IDs
    gamemodeEmojis: {
        mace: '1443179411703726121',
        nethpot: '1443179444914356235',
        overall: '1443179478007283774',
        pot: '1443179706085277758',
        smp: '1443179672467935323',
        sword: '1443179613089173746',
        uhc: '1443179736967942324',
        vanilla: '1443179767615459328'
    },

    // WebSocket Settings for Vote Rewards
    websocketSecret: 'your_shared_secret_change_me',
    websocketPort: 8081,
    // Role ID that bypasses vote cooldown
    VoteCDBypassId: '',
};
