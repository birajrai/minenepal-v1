// src/routes/dashboard/rankings.js
// Rankings CRUD routes for dashboard

const express = require('express');
const apicache = require('apicache');
const cache = apicache.middleware;

module.exports = function (UserInfo) {
    const router = express.Router();

    // List all users (rankings overview) - use aggregation to compute total points server-side
    // and cache results briefly to improve performance.
    router.get('/', cache('30 seconds'), async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            const search = req.query.search || '';
            const sort = req.query.sort || 'points'; // 'points' or 'name'

            const match = {};
            if (search) {
                match.$or = [
                    { minecraftName: { $regex: search, $options: 'i' } },
                    { discordId: { $regex: search, $options: 'i' } }
                ];
            }

            // Aggregation pipeline: compute totalPoints from the `points` map
            const pipeline = [
                { $match: match },
                {
                    $addFields: {
                        totalPoints: {
                            $sum: {
                                $map: {
                                    input: { $objectToArray: '$points' },
                                    in: '$$this.v'
                                }
                            }
                        }
                    }
                }
            ];

            // Sorting
            if (sort === 'points') {
                pipeline.push({ $sort: { totalPoints: -1 } });
            } else if (sort === 'name') {
                pipeline.push({ $sort: { minecraftName: 1 } });
            }

            // Count total matching documents efficiently
            const countPipeline = [...pipeline, { $count: 'total' }];
            const countResult = await UserInfo.aggregate(countPipeline).exec();
            const totalUsers = (countResult[0] && countResult[0].total) || 0;
            const totalPages = Math.ceil(totalUsers / limit);

            // Add pagination
            pipeline.push({ $skip: skip }, { $limit: limit });

            // Project fields returned to view
            pipeline.push({
                $project: {
                    discordId: 1,
                    minecraftName: 1,
                    points: 1,
                    ranks: 1,
                    totalPoints: 1,
                    createdAt: 1
                }
            });

            const users = await UserInfo.aggregate(pipeline).exec();

            res.render('dashboard/rankings', {
                users,
                user: req.session.user,
                error: req.flash('error'),
                pagination: {
                    page,
                    totalPages,
                    totalUsers,
                    hasNext: page < totalPages,
                    hasPrev: page > 1,
                    nextPage: page + 1,
                    prevPage: page - 1
                },
                query: {
                    search,
                    sort
                }
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            req.flash('error', 'Failed to fetch users');
            res.redirect('/dashboard');
        }
    });

    // Show form to edit a user's points/ranks
    router.get('/edit/:id', async (req, res) => {
        try {
            const user = await UserInfo.findById(req.params.id).lean();
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/dashboard/rankings');
            }
            res.render('dashboard/ranking_form', {
                user: req.session.user,
                userData: user,
                action: 'Edit',
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            req.flash('error', 'Failed to fetch user');
            res.redirect('/dashboard/rankings');
        }
    });

    // Handle update of a user's points/ranks
    router.post('/edit/:id', async (req, res) => {
        try {
            const { gamemode_name, gamemode_points, gamemode_current_rank, gamemode_previous_rank } = req.body;

            // Build points and ranks objects from form arrays
            const points = {};
            const ranks = {};

            if (Array.isArray(gamemode_name)) {
                // Multiple gamemodes
                for (let i = 0; i < gamemode_name.length; i++) {
                    const name = gamemode_name[i].trim();
                    if (name) {
                        points[name] = parseInt(gamemode_points[i]) || 0;
                        ranks[name] = {
                            current: gamemode_current_rank[i] || 'Unranked',
                            previous: gamemode_previous_rank[i] || 'Unranked'
                        };
                    }
                }
            } else if (gamemode_name) {
                // Single gamemode
                const name = gamemode_name.trim();
                if (name) {
                    points[name] = parseInt(gamemode_points) || 0;
                    ranks[name] = {
                        current: gamemode_current_rank || 'Unranked',
                        previous: gamemode_previous_rank || 'Unranked'
                    };
                }
            }

            await UserInfo.findByIdAndUpdate(req.params.id, { points, ranks });
            try { apicache.clear(); } catch (e) {}
            res.redirect('/dashboard/rankings');
        } catch (error) {
            console.error('Error updating user:', error);
            req.flash('error', 'Failed to update user');
            res.redirect('/dashboard/rankings');
        }
    });

    return router;
};
