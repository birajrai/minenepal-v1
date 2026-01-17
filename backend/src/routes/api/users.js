const express = require('express');
const { normalizeGamemodeName } = require('../../utils/helpers');

module.exports = function (UserInfo) {
    const router = express.Router();

    // Get all users
    router.get('/', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const users = await UserInfo.find({}, { _id: 0, __v: 0 });
            const formattedUsers = users.map(user => {
                const userObject = user.toObject();
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
                
                // Calculate total points
                let totalPoints = 0;
                for (const pts of Object.values(userObject.points || {})) {
                    totalPoints += pts || 0;
                }
                
                return {
                    // Basic Info
                    discordId: userObject.discordId,
                    minecraftName: userObject.minecraftName,
                    
                    // Location
                    province: userObject.province || null,
                    city: userObject.city || null,
                    
                    // Stats
                    totalPoints,
                    points: userObject.points || {},
                    ranks: cleanRanks,
                    
                    // Metadata
                    createdAt: userObject.createdAt,
                    updatedAt: userObject.updatedAt
                };
            });
            res.json(formattedUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get a specific user's full information
    router.get('/:discordId', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const user = await UserInfo.findOne({ discordId: req.params.discordId }, { _id: 0, __v: 0 });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userObject = user.toObject();

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
            
            // Calculate total points
            let totalPoints = 0;
            for (const pts of Object.values(userObject.points || {})) {
                totalPoints += pts || 0;
            }

            res.json({
                // Basic Info
                discordId: userObject.discordId,
                minecraftName: userObject.minecraftName,
                
                // Location
                province: userObject.province || null,
                city: userObject.city || null,
                
                // Stats
                totalPoints,
                points: userObject.points || {},
                ranks: cleanRanks,
                
                // Metadata
                createdAt: userObject.createdAt,
                updatedAt: userObject.updatedAt
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get a specific user's points (overall or by gamemode)
    router.get('/:discordId/points', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const user = await UserInfo.findOne({ discordId: req.params.discordId });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const gamemodeInput = req.query.gamemode;
            if (gamemodeInput) {
                // Find actual gamemode key (case-insensitive)
                const userPoints = user.points instanceof Map ? Object.fromEntries(user.points) : user.points;
                const target = normalizeGamemodeName(gamemodeInput);
                const actualGamemode = Object.keys(userPoints).find(key => normalizeGamemodeName(key) === target);

                if (!actualGamemode) {
                    return res.status(404).json({ error: `Gamemode '${gamemodeInput}' not found for this user` });
                }

                const points = userPoints[actualGamemode] || 0;
                res.json({ 
                    gamemode: actualGamemode, 
                    points,
                    minecraftName: user.minecraftName,
                    discordId: user.discordId
                });
            } else {
                let totalPoints = 0;
                if (user.points instanceof Map) {
                    for (const pts of user.points.values()) {
                        totalPoints += pts;
                    }
                } else {
                    for (const mode in user.points) {
                        totalPoints += user.points[mode];
                    }
                }
                res.json({
                    minecraftName: user.minecraftName,
                    discordId: user.discordId,
                    overall: totalPoints,
                    gamemodes: Object.fromEntries(user.points instanceof Map ? user.points : Object.entries(user.points))
                });
            }
        } catch (error) {
            console.error('Error fetching user points:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get a specific user's ranks (overall or by gamemode)
    router.get('/:discordId/ranks', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const user = await UserInfo.findOne({ discordId: req.params.discordId });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            const gamemodeInput = req.query.gamemode;
            if (gamemodeInput) {
                // Find actual gamemode key (case-insensitive)
                const userRanks = user.ranks instanceof Map ? Object.fromEntries(user.ranks) : user.ranks;
                const target = normalizeGamemodeName(gamemodeInput);
                const actualGamemode = Object.keys(userRanks).find(key => normalizeGamemodeName(key) === target);

                if (!actualGamemode) {
                    return res.status(404).json({ error: `Gamemode '${gamemodeInput}' not found for this user` });
                }

                const rankData = userRanks[actualGamemode];
                res.json({
                    minecraftName: user.minecraftName,
                    discordId: user.discordId,
                    gamemode: actualGamemode,
                    rank: rankData ? rankData : { current: 'Unranked', previous: 'Unranked' }
                });
            } else {
                const formattedRanks = {};
                if (user.ranks instanceof Map) {
                    for (const [mode, rankData] of user.ranks.entries()) {
                        formattedRanks[mode] = rankData;
                    }
                } else {
                    Object.assign(formattedRanks, user.ranks);
                }
                res.json({ 
                    minecraftName: user.minecraftName,
                    discordId: user.discordId,
                    gamemodes: formattedRanks 
                });
            }
        } catch (error) {
            console.error('Error fetching user ranks:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
