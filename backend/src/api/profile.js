const express = require('express');

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = function (UserInfo) {
  const router = express.Router();

  // Get a user by minecraftName (case-insensitive) or discordId
  // Example: GET /api/profile/PlayerName
  router.get('/:username', async (req, res) => {
    if (!UserInfo) return res.status(500).json({ error: 'UserInfo model not initialized' });

    try {
      const username = (req.params.username || '').trim();
      if (!username) return res.status(400).json({ error: 'Missing username' });

      let user = null;

      // If the username looks like a Discord ID (all digits, length >= 17), try discordId first
      if (/^\d{17,}$/.test(username)) {
        user = await UserInfo.findOne({ discordId: username }, { _id: 0, __v: 0 });
      }

      if (!user) {
        // Try case-insensitive exact match on minecraftName
        const regex = new RegExp(`^${escapeRegExp(username)}$`, 'i');
        user = await UserInfo.findOne({ minecraftName: regex }, { _id: 0, __v: 0 });
      }

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userObject = user.toObject ? user.toObject() : user;

      // Convert Mongoose Maps to plain objects for ranks and points
      if (userObject.ranks instanceof Map) {
        userObject.ranks = Object.fromEntries(userObject.ranks);
      }
      if (userObject.points instanceof Map) {
        userObject.points = Object.fromEntries(userObject.points);
      }
      
      // Clean up rank objects to remove _id
      const cleanRanks = {};
      for (const [mode, rankData] of Object.entries(userObject.ranks || {})) {
        cleanRanks[mode] = {
          current: rankData.current,
          previous: rankData.previous
        };
      }

      // Compute overall points for convenience
      let overallPoints = 0;
      if (userObject.points) {
        for (const val of Object.values(userObject.points)) {
          overallPoints += Number(val) || 0;
        }
      }

      const response = {
        // Basic Info
        discordId: userObject.discordId,
        minecraftName: userObject.minecraftName,
        
        // Location
        province: userObject.province || null,
        city: userObject.city || null,
        
        // Stats
        overallPoints,
        points: userObject.points || {},
        ranks: cleanRanks,
        
        // Metadata
        createdAt: userObject.createdAt || null,
        updatedAt: userObject.updatedAt || null
      };

      res.json(response);
    } catch (err) {
      console.error('Error fetching profile:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
};
