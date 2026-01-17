// src/routes/dashboard/backup.js
// Backup and restore functionality for admin dashboard

const express = require('express');
const UserInfo = require('../../models/userInfo');
const Server = require('../../models/server');
const Waitlist = require('../../models/waitlist');
const WaitlistSettings = require('../../models/waitlistSettings');
const ServerStatusSettings = require('../../models/serverStatusSettings');
const VerificationSettings = require('../../models/verificationSettings');

const router = express.Router();

/**
 * Export all database data as JSON
 * GET /dashboard/backup/export
 */
router.get('/export', async (req, res) => {
    try {
        // Fetch all collections
        const [users, servers, waitlists, waitlistSettings, serverStatusSettings, verificationSettings] = await Promise.all([
            UserInfo.find({}).lean(),
            Server.find({}).lean(),
            Waitlist.find({}).lean(),
            WaitlistSettings.findOne({}).lean(),
            ServerStatusSettings.findOne({}).lean(),
            VerificationSettings.findOne({}).lean()
        ]);

        // Create backup object
        const backup = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            data: {
                users,
                servers,
                waitlists,
                waitlistSettings: waitlistSettings || {},
                serverStatusSettings: serverStatusSettings || {},
                verificationSettings: verificationSettings || {}
            }
        };

        // Set headers for file download
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="minenepal-backup-${Date.now()}.json"`);

        res.json(backup);
    } catch (error) {
        console.error('Error during backup export:', error);
        res.status(500).json({ error: 'Failed to export backup' });
    }
});

/**
 * Display import form
 * GET /dashboard/backup/import
 */
router.get('/import', (req, res) => {
    res.render('dashboard/import_backup', {
        user: req.session.user,
        message: req.flash('message'),
        error: req.flash('error')
    });
});

/**
 * Import backup data
 * POST /dashboard/backup/import
 */
router.post('/import', async (req, res) => {
    try {
        if (!req.body.backupData) {
            req.flash('error', 'No backup data provided');
            return res.redirect('/dashboard/backup/import');
        }

        let backupData;
        try {
            backupData = typeof req.body.backupData === 'string' 
                ? JSON.parse(req.body.backupData) 
                : req.body.backupData;
        } catch (parseError) {
            req.flash('error', 'Invalid JSON format in backup data');
            return res.redirect('/dashboard/backup/import');
        }

        if (!backupData.data) {
            req.flash('error', 'Backup data structure is invalid');
            return res.redirect('/dashboard/backup/import');
        }

        const mode = req.body.importMode || 'merge'; // 'merge' or 'replace'

        // Import data based on mode
        if (mode === 'replace') {
            // Clear existing data first
            await Promise.all([
                UserInfo.deleteMany({}),
                Server.deleteMany({}),
                Waitlist.deleteMany({})
            ]);
        }

        // Import users
        if (backupData.data.users && Array.isArray(backupData.data.users)) {
            for (const user of backupData.data.users) {
                // Remove MongoDB IDs to allow fresh creation
                delete user._id;
                delete user.__v;
                
                if (mode === 'replace' || !(await UserInfo.findOne({ discordId: user.discordId }))) {
                    await UserInfo.create(user);
                }
            }
        }

        // Import servers
        if (backupData.data.servers && Array.isArray(backupData.data.servers)) {
            for (const server of backupData.data.servers) {
                delete server._id;
                delete server.__v;
                
                if (mode === 'replace' || !(await Server.findOne({ slug: server.slug }))) {
                    await Server.create(server);
                }
            }
        }

        // Import waitlists
        if (backupData.data.waitlists && Array.isArray(backupData.data.waitlists)) {
            for (const waitlist of backupData.data.waitlists) {
                delete waitlist._id;
                delete waitlist.__v;
                
                if (mode === 'replace' || !(await Waitlist.findOne({ gamemode: waitlist.gamemode }))) {
                    await Waitlist.create(waitlist);
                }
            }
        }

        // Import settings (single documents)
        if (backupData.data.waitlistSettings && Object.keys(backupData.data.waitlistSettings).length > 0) {
            delete backupData.data.waitlistSettings._id;
            await WaitlistSettings.findOneAndUpdate({}, backupData.data.waitlistSettings, { upsert: true });
        }

        if (backupData.data.serverStatusSettings && Object.keys(backupData.data.serverStatusSettings).length > 0) {
            delete backupData.data.serverStatusSettings._id;
            await ServerStatusSettings.findOneAndUpdate({}, backupData.data.serverStatusSettings, { upsert: true });
        }

        if (backupData.data.verificationSettings && Object.keys(backupData.data.verificationSettings).length > 0) {
            delete backupData.data.verificationSettings._id;
            await VerificationSettings.findOneAndUpdate({}, backupData.data.verificationSettings, { upsert: true });
        }

        req.flash('message', `Backup imported successfully in ${mode} mode`);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error during backup import:', error);
        req.flash('error', `Import failed: ${error.message}`);
        res.redirect('/dashboard/backup/import');
    }
});

module.exports = router;
