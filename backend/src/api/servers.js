const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Simple in-memory cache for server list
let cachedServers = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Get all servers
router.get('/', async (req, res) => {
    try {
        // Check if cache is still valid
        const now = Date.now();
        if (cachedServers && (now - cacheTimestamp) < CACHE_TTL) {
            return res.json(cachedServers);
        }

        // Fetch servers with status from database - much faster than live queries
        // Filter out disabled servers and exclude internal fields
        const servers = await Server.find(
            { disabled: { $ne: true } },
            { _id: 0, __v: 0, secret: 0 }
        )
            .sort({ featured: -1, vote: -1 })
            .lean();

        // Format response with consistent structure and organized fields
        const formatted = servers.map(s => ({
            // Basic Info
            name: s.name,
            slug: s.slug,
            description: s.description,
            content: s.content,
            
            // Connection Info
            display_address: s.display_address || `${s.ip}:${s.port}`,
            ip: s.ip,
            port: s.port,
            bedrock_ip: s.bedrock_ip || null,
            bedrock_port: s.bedrock_port || null,
            server_type: s.server_type,
            
            // Status Info
            online: s.online || false,
            status: s.online ? 'online' : 'offline',
            players: (s.online && (s.players !== null && s.players !== undefined)) 
                ? { online: s.players || 0, max: s.maxPlayers || 0 } 
                : undefined,
            lastStatusSync: s.lastStatusSync || null,
            
            // Media & Links
            image: s.image || null,
            server_icon: s.server_icon || null,
            website: s.website || null,
            discord: s.discord || null,
            youtube: s.youtube || null,
            
            // Game Info
            gamemodes: s.gamemodes || [],
            
            // Metadata
            vote: s.vote,
            voteCooldownMs: s.voteCooldownMs,
            featured: s.featured || false,
            disabled: s.disabled || false,
            votingRewardEnabled: s.votingRewardEnabled || false,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt
        }));

        // Update cache
        cachedServers = formatted;
        cacheTimestamp = now;

        // Set cache headers
        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
