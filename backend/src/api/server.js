const express = require('express');
const router = express.Router();
const Server = require('../models/server');

// Simple in-memory cache for individual servers
const serverCache = new Map();
const CACHE_TTL = 60000; // 1 minute cache

// Get server by slug
router.get('/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        if (!slug) return res.status(400).json({ error: 'Missing slug' });

        // Check cache
        const cached = serverCache.get(slug);
        if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
            res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
            return res.json(cached.data);
        }

        // Find server by slug; exclude internal fields like secret
        const server = await Server.findOne({ slug: slug }, { _id: 0, __v: 0, secret: 0 }).lean();
        if (!server) return res.status(404).json({ error: `Server not found` });

        // Format response with organized fields
        const formatted = {
            // Basic Info
            name: server.name,
            slug: server.slug,
            description: server.description,
            content: server.content,
            
            // Connection Info
            display_address: server.display_address || `${server.ip}:${server.port}`,
            ip: server.ip,
            port: server.port,
            bedrock_ip: server.bedrock_ip || null,
            bedrock_port: server.bedrock_port || null,
            server_type: server.server_type,
            
            // Status Info
            online: server.online || false,
            status: server.online ? 'online' : 'offline',
            players: (server.online && (server.players !== null && server.players !== undefined)) 
                ? { online: server.players || 0, max: server.maxPlayers || 0 } 
                : undefined,
            lastStatusSync: server.lastStatusSync || null,
            
            // Media & Links
            image: server.image || null,
            server_icon: server.server_icon || null,
            website: server.website || null,
            discord: server.discord || null,
            youtube: server.youtube || null,
            
            // Game Info
            gamemodes: server.gamemodes || [],
            
            // Metadata
            vote: server.vote,
            voteCooldownMs: server.voteCooldownMs,
            featured: server.featured || false,
            disabled: server.disabled || false,
            votingRewardEnabled: server.votingRewardEnabled || false,
            createdAt: server.createdAt,
            updatedAt: server.updatedAt
        };

        // Update cache
        serverCache.set(slug, { data: formatted, timestamp: Date.now() });

        // Clean old cache entries (prevent memory leak)
        if (serverCache.size > 100) {
            const entriesToDelete = [];
            for (const [key, value] of serverCache.entries()) {
                if (Date.now() - value.timestamp > CACHE_TTL * 2) {
                    entriesToDelete.push(key);
                }
            }
            entriesToDelete.forEach(key => serverCache.delete(key));
        }

        res.set('Cache-Control', 'public, max-age=60, s-maxage=60');
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
