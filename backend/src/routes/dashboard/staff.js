const express = require('express');
const { requireOwner, requireAuth } = require('../../middleware/auth');

module.exports = function(Staff) {
    const router = express.Router();

    // List all staff members (only Owner can access)
    router.get('/', requireOwner, async (req, res) => {
        try {
            const staffMembers = await Staff.find()
                .populate('createdBy', 'username')
                .sort({ role: 1, createdAt: -1 })
                .lean();

            res.render('dashboard/staff', {
                user: req.session.user,
                staffMembers,
                success: req.flash('success'),
                error: req.flash('error')
            });
        } catch (error) {
            console.error('Error fetching staff:', error);
            req.flash('error', 'Failed to load staff members');
            res.redirect('/dashboard');
        }
    });

    // Show form to add new staff (only Owner)
    router.get('/add', requireOwner, (req, res) => {
        res.render('dashboard/staff_form', {
            user: req.session.user,
            staff: null,
            error: req.flash('error'),
            isEdit: false
        });
    });

    // Create new staff member (only Owner)
    router.post('/add', requireOwner, async (req, res) => {
        try {
            const { username, email, password1, password2, role, discordId, notes } = req.body;

            // Validation
            if (!username || !password1 || !password2 || !role) {
                req.flash('error', 'Username, both passwords, and role are required');
                return res.redirect('/dashboard/staff/add');
            }

            // Check if username already exists
            const existingStaff = await Staff.findOne({ username: username.toLowerCase().trim() });
            if (existingStaff) {
                req.flash('error', 'Username already exists');
                return res.redirect('/dashboard/staff/add');
            }

            // Create new staff member
            const newStaff = new Staff({
                username: username.trim(),
                email: email ? email.trim() : undefined,
                password1,
                password2,
                role,
                discordId: discordId ? discordId.trim() : undefined,
                notes: notes || '',
                createdBy: req.session.user._id
            });

            await newStaff.save();

            req.flash('success', `Staff member ${username} added successfully`);
            res.redirect('/dashboard/staff');
        } catch (error) {
            console.error('Error creating staff:', error);
            req.flash('error', 'Failed to create staff member');
            res.redirect('/dashboard/staff/add');
        }
    });

    // Show form to edit staff (only Owner)
    router.get('/edit/:id', requireOwner, async (req, res) => {
        try {
            const staff = await Staff.findById(req.params.id).lean();
            
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard/staff');
            }

            res.render('dashboard/staff_form', {
                user: req.session.user,
                staff,
                error: req.flash('error'),
                isEdit: true
            });
        } catch (error) {
            console.error('Error fetching staff:', error);
            req.flash('error', 'Failed to load staff member');
            res.redirect('/dashboard/staff');
        }
    });

    // Update staff member (only Owner)
    router.post('/edit/:id', requireOwner, async (req, res) => {
        try {
            const { username, email, password1, password2, role, discordId, notes, isActive } = req.body;

            const staff = await Staff.findById(req.params.id);
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard/staff');
            }

            // Check if username is being changed to one that already exists
            if (username && username.toLowerCase() !== staff.username.toLowerCase()) {
                const existingStaff = await Staff.findOne({ 
                    username: username.toLowerCase().trim(),
                    _id: { $ne: req.params.id }
                });
                if (existingStaff) {
                    req.flash('error', 'Username already exists');
                    return res.redirect(`/dashboard/staff/edit/${req.params.id}`);
                }
                staff.username = username.trim();
            }

            // Update fields
            if (email !== undefined) staff.email = email.trim() || undefined;
            if (password1) staff.password1 = password1;
            if (password2) staff.password2 = password2;
            if (role) staff.role = role;
            if (discordId !== undefined) staff.discordId = discordId.trim() || undefined;
            if (notes !== undefined) staff.notes = notes;
            staff.isActive = isActive === 'on' || isActive === 'true';

            await staff.save();

            req.flash('success', `Staff member ${staff.username} updated successfully`);
            res.redirect('/dashboard/staff');
        } catch (error) {
            console.error('Error updating staff:', error);
            req.flash('error', 'Failed to update staff member');
            res.redirect(`/dashboard/staff/edit/${req.params.id}`);
        }
    });

    // Delete staff member (only Owner)
    router.post('/delete/:id', requireOwner, async (req, res) => {
        try {
            const staff = await Staff.findById(req.params.id);
            
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard/staff');
            }

            // Prevent deleting yourself
            if (staff._id.toString() === req.session.user._id.toString()) {
                req.flash('error', 'You cannot delete your own account');
                return res.redirect('/dashboard/staff');
            }

            await Staff.findByIdAndDelete(req.params.id);

            req.flash('success', `Staff member ${staff.username} deleted successfully`);
            res.redirect('/dashboard/staff');
        } catch (error) {
            console.error('Error deleting staff:', error);
            req.flash('error', 'Failed to delete staff member');
            res.redirect('/dashboard/staff');
        }
    });

    // View own profile
    router.get('/profile', requireAuth, async (req, res) => {
        try {
            const staff = await Staff.findById(req.session.user._id)
                .populate('createdBy', 'username')
                .lean();
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard');
            }
            res.render('dashboard/staff_profile', {
                user: req.session.user,
                staff,
                isOwnProfile: true,
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            req.flash('error', 'Failed to load profile');
            res.redirect('/dashboard');
        }
    });

    // View another staff profile (Owner only)
    router.get('/profile/:id', requireOwner, async (req, res) => {
        try {
            const staff = await Staff.findById(req.params.id)
                .populate('createdBy', 'username')
                .lean();
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard/staff');
            }
            res.render('dashboard/staff_profile', {
                user: req.session.user,
                staff,
                isOwnProfile: staff._id.toString() === req.session.user._id.toString(),
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error fetching staff profile:', error);
            req.flash('error', 'Failed to load profile');
            res.redirect('/dashboard/staff');
        }
    });

    // Update own profile
    router.post('/profile/update', requireAuth, async (req, res) => {
        try {
            const { email, password1, password2, discordId } = req.body;

            const staff = await Staff.findById(req.session.user._id);
            if (!staff) {
                req.flash('error', 'Staff member not found');
                return res.redirect('/dashboard');
            }

            // Update allowed fields
            if (email !== undefined) staff.email = email.trim() || undefined;
            if (password1) staff.password1 = password1;
            if (password2) staff.password2 = password2;
            if (discordId !== undefined) staff.discordId = discordId.trim() || undefined;

            await staff.save();

            // Update session
            req.session.user = {
                _id: staff._id,
                username: staff.username,
                role: staff.role,
                email: staff.email
            };

            req.flash('success', 'Profile updated successfully');
            res.redirect('/dashboard/staff/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
            req.flash('error', 'Failed to update profile');
            res.redirect('/dashboard/staff/profile');
        }
    });

    return router;
};
