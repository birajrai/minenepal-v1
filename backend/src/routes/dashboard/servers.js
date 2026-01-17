// src/routes/dashboard/servers.js
// Server CRUD routes for dashboard

const express = require('express');
const Server = require('../../models/server');
const { parseGamemodes } = require('../../utils/helpers');
const apicache = require('apicache');

const cache = apicache.middleware;

const router = express.Router();

// List all servers
// Cache server list for short period to speed up dashboard (30s)
router.get('/', cache('30 seconds'), async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const sort = req.query.sort || 'votes'; // 'votes' or 'name'
        const type = req.query.type || '';

        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        if (type) {
            query.server_type = type;
        }

        // Get total count for pagination
        const totalServers = await Server.countDocuments(query);
        const totalPages = Math.ceil(totalServers / limit);

        // Build sort object (use existing model fields: 'vote' and 'name')
        let sortObj = {};
        if (sort === 'votes') {
            sortObj = { vote: -1 }; // Descending by vote
        } else if (sort === 'name') {
            sortObj = { name: 1 }; // Ascending by name
        } else {
            // Fallback
            sortObj = { vote: -1 };
        }

        // Only select fields needed for listing to reduce payload
        const projection = {
            name: 1,
            slug: 1,
            image: 1,
            server_icon: 1,
            gamemodes: 1,
            server_type: 1,
            disabled: 1,
            featured: 1,
            vote: 1,
            secret: 1
        };

        // (sortObj already set above)

        const servers = await Server.find(query, projection)
            .sort(sortObj)
            .skip(skip)
            .limit(limit)
            .lean();

        res.render('dashboard/servers', {
            servers,
            user: req.session.user,
            error: req.flash('error'),
            pagination: {
                page,
                totalPages,
                totalServers,
                hasNext: page < totalPages,
                hasPrev: page > 1,
                nextPage: page + 1,
                prevPage: page - 1
            },
            query: {
                search,
                sort,
                type
            }
        });
    } catch (error) {
        console.error('Error fetching servers:', error);
        res.render('dashboard/servers', {
            servers: [],
            user: req.session.user,
            error: ['Failed to fetch servers'],
            pagination: null,
            query: {}
        });
    }
});

// Show form to add a new server
router.get('/add', (req, res) => {
    res.render('dashboard/server_form', {
        server: null,
        action: 'Add',
        user: req.session.user,
        error: req.flash('error')
    });
});

// Handle creation of a new server
router.post('/add', async (req, res) => {
    try {
        const data = req.body;

        if (!data.server_type) {
            req.flash('error', 'Server type is required.');
            return res.redirect('/dashboard/servers/add');
        }

        // Parse gamemodes using the helper function
        data.gamemodes = parseGamemodes(data.gamemodes);

        // Handle checkboxes
        data.disabled = data.disabled === 'on';
        data.featured = data.featured === 'on';
        data.votingRewardEnabled = data.votingRewardEnabled === 'on';

        // Clean up empty strings for image fields
        if (!data.image || data.image.trim() === '') data.image = null;
        if (!data.server_icon || data.server_icon.trim() === '') data.server_icon = null;
        
        // Trim whitespace from secret if provided
        if (data.secret && typeof data.secret === 'string') {
            data.secret = data.secret.trim();
        }

        await Server.create(data);
        // Clear short-lived caches so dashboard updates are visible quickly
        try { apicache.clear(); } catch (e) { /* ignore cache clear errors */ }
        res.redirect('/dashboard/servers');
    } catch (error) {
        console.error('Error creating server:', error);
        req.flash('error', 'Failed to create server');
        res.redirect('/dashboard/servers/add');
    }
});

// Show form to edit an existing server
router.get('/edit/:id', async (req, res) => {
    try {
        const server = await Server.findById(req.params.id).lean();
        if (!server) {
            req.flash('error', 'Server not found');
            return res.redirect('/dashboard/servers');
        }
        
        res.render('dashboard/server_form', {
            server,
            action: 'Edit',
            user: req.session.user,
            error: req.flash('error')
        });
    } catch (error) {
        console.error('Error fetching server:', error);
        req.flash('error', 'Failed to fetch server');
        res.redirect('/dashboard/servers');
    }
});

// Handle update of an existing server
router.post('/edit/:id', async (req, res) => {
    try {
        const data = req.body;

        if (!data.server_type) {
            req.flash('error', 'Server type is required.');
            return res.redirect(`/dashboard/servers/edit/${req.params.id}`);
        }

        // Parse gamemodes using the helper function
        data.gamemodes = parseGamemodes(data.gamemodes);

        // Handle checkboxes
        data.disabled = data.disabled === 'on';
        data.featured = data.featured === 'on';
        data.votingRewardEnabled = data.votingRewardEnabled === 'on';

        // Clean up empty strings for image fields
        if (!data.image || data.image.trim() === '') data.image = null;
        if (!data.server_icon || data.server_icon.trim() === '') data.server_icon = null;
        
        // Trim whitespace from secret if provided
        if (data.secret && typeof data.secret === 'string') {
            data.secret = data.secret.trim();
        }

        await Server.findByIdAndUpdate(req.params.id, data);
        try { apicache.clear(); } catch (e) {}
        res.redirect('/dashboard/servers');
    } catch (error) {
        console.error('Error updating server:', error);
        req.flash('error', 'Failed to update server');
        res.redirect(`/dashboard/servers/edit/${req.params.id}`);
    }
});

// Delete a server
router.post('/delete/:id', async (req, res) => {
    try {
        await Server.findByIdAndDelete(req.params.id);
        try { apicache.clear(); } catch (e) {}
        res.redirect('/dashboard/servers');
    } catch (error) {
        console.error('Error deleting server:', error);
        req.flash('error', 'Failed to delete server');
        res.redirect('/dashboard/servers');
    }
});

module.exports = router;

