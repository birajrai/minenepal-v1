const express = require('express');
const Server = require('../../models/server');
const Vote = require('../../models/vote');
const VoteCooldown = require('../../models/voteCooldown');
const { broadcastVote } = require('../../web');

module.exports = (UserInfo) => {
  const router = express.Router();

  router.get('/cooldown', async (req, res) => {
    try {
      const { username, discordId, server } = req.query || {};

      if (!server || (!username && !discordId)) {
        return res.status(400).json({
          success: false,
          error: 'server and username or discordId are required'
        });
      }

      const cleanServer = server.trim();
      let cleanUsername = username ? username.trim() : null;

      // If discordId provided but no username, try to resolve username from UserInfo
      if (!cleanUsername && discordId) {
        const user = await UserInfo.findOne({ discordId });
        if (user && user.minecraftName) {
          cleanUsername = user.minecraftName;
        }
      }

      // If still no username, we can't check cooldown effectively
      if (!cleanUsername) {
        return res.json({
          success: true,
          cooldownMs: 0,
          serverCooldownMs: 12 * 60 * 60 * 1000 // Default
        });
      }

      // Get server-specific cooldown using canonical slug
      const serverDoc = await Server.findOne({ slug: cleanServer, disabled: { $ne: true } }).collation({ locale: 'en', strength: 2 });
      const serverCooldownMs = serverDoc && serverDoc.voteCooldownMs ? serverDoc.voteCooldownMs : 12 * 60 * 60 * 1000;
      const targetSlug = serverDoc ? serverDoc.slug : cleanServer;

      // Check cooldown from VoteCooldown collection
      const cooldownDoc = await VoteCooldown.findOne({
        username: cleanUsername,
        serverSlug: targetSlug
      }).collation({ locale: 'en', strength: 2 });

      const now = Date.now();
      let cooldown = 0;

      if (cooldownDoc) {
        const diff = now - cooldownDoc.lastVotedAt;
        if (diff < serverCooldownMs) {
          cooldown = serverCooldownMs - diff;
        }
      }

      return res.json({
        success: true,
        cooldownMs: cooldown,
        serverCooldownMs
      });
    } catch (err) {
      console.error('Vote cooldown API error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  // POST /api/vote
  // Body: { username: string, server: string (slug), discordId?: string, secret?: string }
  // Returns: { success: true }
  router.post('/', async (req, res) => {
    try {
      const { username, server, discordId, secret } = req.body || {};

      if (!username || !server) {
        return res.status(400).json({ success: false, error: 'username and server are required' });
      }

      const cleanServer = server.trim();
      const cleanUsername = username ? username.trim() : null;

      // Find server using case-insensitive match to get canonical slug
      const serverDoc = await Server.findOne({ slug: cleanServer, disabled: { $ne: true } }).collation({ locale: 'en', strength: 2 });
      if (!serverDoc) {
        return res.status(404).json({ success: false, error: 'Server not found or disabled' });
      }

      const targetSlug = serverDoc.slug;
      const serverCooldownMs = serverDoc.voteCooldownMs || 12 * 60 * 60 * 1000;

      let sendRewards = false;
      if (secret && secret.trim() !== '') {
        if (!serverDoc.secret || secret.trim() !== serverDoc.secret.trim()) {
          return res.status(403).json({ success: false, error: 'Invalid secret for vote reward' });
        }
        if (!serverDoc.votingRewardEnabled) {
          return res.status(403).json({ success: false, error: 'Voting rewards are not enabled for this server' });
        }
        sendRewards = true;
      }

      const now = Date.now();

      // Check cooldown from VoteCooldown collection
      const cooldownDoc = await VoteCooldown.findOne({
        username: cleanUsername,
        serverSlug: targetSlug
      }).collation({ locale: 'en', strength: 2 });

      if (cooldownDoc) {
        const diff = now - cooldownDoc.lastVotedAt;
        if (diff < serverCooldownMs) {
          const cooldown = serverCooldownMs - diff;
          const hours = Math.floor(cooldown / (1000 * 60 * 60));
          const minutes = Math.floor((cooldown % (1000 * 60 * 60)) / (1000 * 60));
          const timeMsg = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

          return res.status(429).json({
            success: false,
            error: `You can vote again in ${timeMsg}`,
            cooldownMs: cooldown,
            serverCooldownMs
          });
        }

        // Update existing cooldown document
        cooldownDoc.lastVotedAt = now;
        await cooldownDoc.save();
      } else {
        // Create new cooldown document
        await VoteCooldown.create({
          username: cleanUsername,
          serverSlug: targetSlug,
          lastVotedAt: now
        });
      }

      // Ensure user exists in UserInfo (create if not exists)
      let user = await UserInfo.findOne({ minecraftName: cleanUsername }).collation({ locale: 'en', strength: 2 });
      if (!user) {
        user = new UserInfo({
          minecraftName: cleanUsername,
          lastVoted: new Map()
        });
        await user.save();
      }

      // Increment server vote count atomically
      await Server.updateOne({ _id: serverDoc._id }, { $inc: { vote: 1 } });

      // Record the vote in Vote collection (for history)
      const newVote = new Vote({
        username: cleanUsername,
        server: serverDoc._id,
        serverSlug: targetSlug,
        timestamp: new Date(now)
      });
      await newVote.save();

      if (sendRewards) {
        broadcastVote({ username: cleanUsername, server: targetSlug });
      }

      return res.json({ success: true, data: { server: targetSlug, username: cleanUsername, rewardSent: sendRewards } });
    } catch (err) {
      console.error('Vote API error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  router.get('/history/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const requestedLimit = parseInt(req.query.limit, 10);
      const limit = !isNaN(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 10) : 10;

      const votes = await Vote.find({ serverSlug: slug })
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('username timestamp')
        .lean();

      return res.json({ success: true, data: votes });
    } catch (err) {
      console.error('Vote history API error:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  });

  return router;
};
