const express = require('express');

module.exports = function (UserInfo) {
    const router = express.Router();

    const { normalizeGamemodeName } = require('../../utils/helpers');

    // Helper function to find actual gamemode key (robust matching)
    async function findGamemodeKey(gamemodeInput) {
        if (!gamemodeInput) return null;
        const target = normalizeGamemodeName(gamemodeInput);

        // Try a handful of users that have points and look for matching keys across them
        const sampleUsers = await UserInfo.find({ 'points': { $ne: {} } }).limit(20).lean();
        if (!sampleUsers || sampleUsers.length === 0) return null;

        for (const sampleUser of sampleUsers) {
            const pointsObj = sampleUser.points || {};

            const keys = Object.keys(pointsObj);
            for (const key of keys) {
                if (normalizeGamemodeName(key) === target) {
                    return key; // return the actual stored key
                }
            }
        }

        return null;
    }

    // Get main leaderboard
    router.get('/', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const users = await UserInfo.find({}, { _id: 0, __v: 0 });
            const leaderboardData = users.map(user => {
                const userObject = user.toObject();

                // Convert Mongoose Maps to plain objects for ranks and points, and remove _id from nested rank objects
                const processedRanks = {};
                if (userObject.ranks instanceof Map) {
                    for (const [mode, rankData] of userObject.ranks.entries()) {
                        const plainRankData = rankData ? rankData.toObject() : {};
                        if (plainRankData._id) {
                            delete plainRankData._id;
                        }
                        processedRanks[mode] = { current: plainRankData.current, previous: plainRankData.previous };
                    }
                } else if (userObject.ranks) {
                    for (const mode in userObject.ranks) {
                        const rankData = userObject.ranks[mode];
                        const plainRankData = rankData ? { ...rankData } : {};
                        if (plainRankData._id) {
                            delete plainRankData._id;
                        }
                        processedRanks[mode] = { current: plainRankData.current, previous: plainRankData.previous };
                    }
                }
                userObject.ranks = processedRanks;

                if (userObject.points instanceof Map) {
                    userObject.points = Object.fromEntries(userObject.points);
                }

                // Calculate total points
                let totalPoints = 0;
                if (userObject.points) {
                    for (const mode in userObject.points) {
                        totalPoints += userObject.points[mode];
                    }
                }

                return {
                    discordId: userObject.discordId,
                    minecraftName: userObject.minecraftName || userObject.discordId,
                    totalPoints: totalPoints,
                    ranks: userObject.ranks || {},
                    province: userObject.province || null,
                    city: userObject.city || null
                };
            });

            // Filter out users with 0 total points
            const filteredLeaderboard = leaderboardData.filter(user => user.totalPoints > 0);

            // Sort leaderboard by total points in descending order
            filteredLeaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

            // Assign rankId after sorting
            const rankedLeaderboard = filteredLeaderboard.map((user, index) => ({
                rankId: index + 1,
                ...user
            }));

            res.json(rankedLeaderboard);
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get overall points leaderboard
    router.get('/points', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const allUsersInfo = await UserInfo.find({ 'points': { $ne: {} } }, { _id: 0, __v: 0 }).lean();

            const leaderboard = allUsersInfo.map((user, index) => {
                let totalPoints = 0;
                for (const [mode, pts] of Object.entries(user.points || {})) {
                    totalPoints += pts;
                }
                return {
                    rank: index + 1,
                    discordId: user.discordId,
                    minecraftName: user.minecraftName,
                    totalPoints,
                    currentRank: (user.ranks && user.ranks.overall && user.ranks.overall.current) ? user.ranks.overall.current : 'Unranked',
                    province: user.province || null,
                    city: user.city || null
                };
            }).filter(user => user.totalPoints > 0)
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .slice(0, 10);

            res.json(leaderboard);
        } catch (error) {
            console.error('Error fetching overall points leaderboard:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // Get points leaderboard by gamemode (case-insensitive)
    router.get('/points/:gamemode', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }
        try {
            const actualGamemode = await findGamemodeKey(req.params.gamemode);

            if (!actualGamemode) {
                return res.status(404).json({ error: `Gamemode '${req.params.gamemode}' not found` });
            }

            // Filter to only include users with points > 0 for this gamemode
            const leaderboard = await UserInfo.find({
                [`points.${actualGamemode}`]: { $gt: 0 }
            }, { _id: 0, __v: 0 })
                .sort({ [`points.${actualGamemode}`]: -1 })
                .limit(10)
                .lean();

            const formattedLeaderboard = leaderboard.map((user, index) => ({
                rank: index + 1,
                discordId: user.discordId,
                minecraftName: user.minecraftName,
                gamemode: actualGamemode,
                points: user.points[actualGamemode],
                currentRank: (user.ranks && user.ranks[actualGamemode] && user.ranks[actualGamemode].current) ? user.ranks[actualGamemode].current : 'Unranked',
                province: user.province || null,
                city: user.city || null
            }));

            res.json(formattedLeaderboard);
        } catch (error) {
            console.error(`Error fetching ${req.params.gamemode} points leaderboard:`, error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // (debug endpoint removed)

    // Get leaderboard by gamemode (case-insensitive)
    router.get('/:gamemode', async (req, res) => {
        if (!UserInfo) {
            return res.status(500).json({ error: 'UserInfo model not initialized' });
        }

        try {
            const actualGamemode = await findGamemodeKey(req.params.gamemode);

            if (!actualGamemode) {
                return res.status(404).json({ error: `Gamemode '${req.params.gamemode}' not found` });
            }

            const users = await UserInfo.find({
                $or: [
                    { [`points.${actualGamemode}`]: { $exists: true } },
                    { [`ranks.${actualGamemode}`]: { $exists: true } }
                ]
            }, { _id: 0, __v: 0 });

            const leaderboardData = users.map(user => {
                const userObject = user.toObject();

                // Convert Mongoose Maps to plain objects for ranks and points
                if (userObject.ranks instanceof Map) {
                    userObject.ranks = Object.fromEntries(userObject.ranks);
                }
                if (userObject.points instanceof Map) {
                    userObject.points = Object.fromEntries(userObject.points);
                }

                // Extract gamemode-specific points, default to 0 if not present
                const gamemodePoints = userObject.points && userObject.points[actualGamemode] ? userObject.points[actualGamemode] : 0;

                // Extract gamemode-specific rank
                const gamemodeRank = (userObject.ranks && userObject.ranks[actualGamemode] && userObject.ranks[actualGamemode].current) ? userObject.ranks[actualGamemode].current : 'Unranked';

                return {
                    discordId: userObject.discordId,
                    minecraftName: userObject.minecraftName || userObject.discordId,
                    gamemode: actualGamemode,
                    points: gamemodePoints,
                    currentRank: gamemodeRank,
                    province: userObject.province || null,
                    city: userObject.city || null
                };
            });

            // Filter out users with 0 points in this gamemode
            const filteredLeaderboard = leaderboardData.filter(user => user.points > 0);

            // Sort leaderboard by gamemode points in descending order
            filteredLeaderboard.sort((a, b) => b.points - a.points);

            // Assign rankId after sorting
            const rankedLeaderboard = filteredLeaderboard.map((user, index) => ({
                rankId: index + 1,
                ...user
            }));

            res.json(rankedLeaderboard);
        } catch (error) {
            console.error(`Error fetching ${req.params.gamemode} leaderboard:`, error);
            res.status(500).json({ error: `Failed to fetch ${req.params.gamemode} leaderboard` });
        }
    });

    return router;
};
