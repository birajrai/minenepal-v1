// src/routes/dashboard/users.js
// User management routes for dashboard

const express = require('express');
const apicache = require('apicache');
const cache = apicache.middleware;

module.exports = function (UserInfo) {
    const router = express.Router();

    // List all users (cached briefly)
    router.get('/', cache('30 seconds'), async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 10;
            const skip = (page - 1) * limit;
            const search = req.query.search || '';
            const sort = req.query.sort || 'newest'; // 'newest', 'oldest', 'name'

            let query = {};
            if (search) {
                query = {
                    $or: [
                        { minecraftName: { $regex: search, $options: 'i' } },
                        { discordId: { $regex: search, $options: 'i' } },
                        { city: { $regex: search, $options: 'i' } }
                    ]
                };
            }

            let sortObj = {};
            if (sort === 'newest') sortObj = { createdAt: -1 };
            else if (sort === 'oldest') sortObj = { createdAt: 1 };
            else if (sort === 'name') sortObj = { minecraftName: 1 };

            const totalUsers = await UserInfo.countDocuments(query);
            const totalPages = Math.ceil(totalUsers / limit);

            // Project only fields required by the dashboard list view
            const projection = {
                discordId: 1,
                minecraftName: 1,
                province: 1,
                city: 1,
                points: 1,
                createdAt: 1
            };

            const users = await UserInfo.find(query, projection)
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .lean();

            res.render('dashboard/users', {
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

    // Show form to edit a user
    router.get('/edit/:id', async (req, res) => {
        try {
            const user = await UserInfo.findById(req.params.id).lean();
            if (!user) {
                req.flash('error', 'User not found');
                return res.redirect('/dashboard/users');
            }
            res.render('dashboard/user_form', {
                user: req.session.user,
                userData: user,
                action: 'Edit',
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error fetching user:', error);
            req.flash('error', 'Failed to fetch user');
            res.redirect('/dashboard/users');
        }
    });

    // Handle update of a user
    router.post('/edit/:id', async (req, res) => {
        try {
            const { minecraftName, province, city } = req.body;

            await UserInfo.findByIdAndUpdate(req.params.id, {
                minecraftName: minecraftName.trim(),
                province: province.trim(),
                city: city.trim()
            });

            // Clear caches so dashboard and lists reflect the change
            try { apicache.clear(); } catch (e) {}

            req.flash('success', 'User updated successfully');
            res.redirect('/dashboard/users');
        } catch (error) {
            console.error('Error updating user:', error);
            req.flash('error', 'Failed to update user');
            res.redirect(`/dashboard/users/edit/${req.params.id}`);
        }
    });

    // Delete a user
    router.post('/delete/:id', async (req, res) => {
        try {
            await UserInfo.findByIdAndDelete(req.params.id);
            try { apicache.clear(); } catch (e) {}
            req.flash('success', 'User deleted successfully');
            res.redirect('/dashboard/users');
        } catch (error) {
            console.error('Error deleting user:', error);
            req.flash('error', 'Failed to delete user');
            res.redirect('/dashboard/users');
        }
    });

    return router;
};
