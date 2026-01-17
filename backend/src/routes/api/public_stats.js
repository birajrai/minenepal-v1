const express = require('express');
const router = express.Router();
const Server = require('../../models/server');

module.exports = function(bot) {
  router.get('/', async (req, res) => {
    try {
      // Count total servers and active servers
      const totalServers = await Server.countDocuments();
      const totalActiveServers = await Server.countDocuments({ 
        disabled: { $ne: true } 
      });

      // Count active players from servers that are online
      const onlineServers = await Server.find({ 
        online: true,
        disabled: { $ne: true }
      }).select('players').lean();
      
      const totalActivePlayers = onlineServers.reduce((sum, server) => {
        return sum + (server.players || 0);
      }, 0);

      // Get Discord member counts from authorized guilds
      let totalDiscordMembers = 0;
      let activeDiscordMembers = 0;

      if (bot && bot.guilds && bot.guilds.cache) {
        for (const [guildId, guild] of bot.guilds.cache) {
          // Total members includes all members (cached memberCount)
          totalDiscordMembers += guild.memberCount || 0;
          
          // Active members: online, idle, or dnd (not offline)
          // Note: This requires the GUILD_PRESENCES intent for accurate counts
          // We'll use approximate cache-based count
          if (guild.members && guild.members.cache) {
            const activeInGuild = guild.members.cache.filter(member => {
              const presence = member.presence;
              return presence && presence.status && presence.status !== 'offline';
            }).size;
            activeDiscordMembers += activeInGuild;
          }
        }
      }

      res.json({
        total_servers: totalServers,
        total_active_players: totalActivePlayers,
        total_discord_members: totalDiscordMembers,
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching public stats:', error);
      res.json({
        total_servers: 0,
        total_active_players: 0,
        total_discord_members: 0,
        last_updated: new Date().toISOString(),
        error: 'Failed to fetch statistics'
      });
    }
  });

  return router;
};
