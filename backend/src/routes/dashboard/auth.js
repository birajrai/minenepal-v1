const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const config = require('../../config/config');
// Auth system using Staff model with role-based permissions

module.exports = function(Staff) {
    const router = express.Router();

    // Rate limiter for login attempts
    const loginLimiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // Limit each IP to 10 login requests per windowMs
        message: 'Too many login attempts from this IP, please try again after 15 minutes',
        standardHeaders: true,
        legacyHeaders: false,
    });

    // Show login form
    router.get('/login', (req, res) => {
        res.render('auth/login', { error: req.flash('error') });
    });

    // Handle login form submission
    router.post('/login', loginLimiter, async (req, res) => {
        let { username, pass1, pass2 } = req.body;

        // Basic sanitization
        if (typeof username === 'string') username = username.trim();
        if (typeof pass1 === 'string') pass1 = pass1.trim();
        if (typeof pass2 === 'string') pass2 = pass2.trim();

        // 1. Verify Cloudflare Turnstile
        const turnstileToken = req.body['cf-turnstile-response'];

        if (!turnstileToken) {
            req.flash('error', 'Please complete the captcha challenge.');
            return res.redirect('/auth/login');
        }

        try {
            const verifyResponse = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify',
                new URLSearchParams({
                    secret: config.turnstileSecretKey,
                    response: turnstileToken
                }).toString(),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            if (!verifyResponse.data || !verifyResponse.data.success) {
                req.flash('error', 'Captcha verification failed. Please try again.');
                return res.redirect('/auth/login');
            }
        } catch (err) {
            console.error('Turnstile verification error:', err);
            req.flash('error', 'Captcha verification error. Please try again.');
            return res.redirect('/auth/login');
        }

        // 2. Check credentials against Staff model
        try {
            const staff = await Staff.findOne({ 
                username: username.toLowerCase(),
                isActive: true
            });

            if (!staff) {
                req.flash('error', 'Invalid credentials or account is inactive');
                return res.redirect('/auth/login');
            }

            // Verify both passwords using bcrypt
            const pass1Valid = await staff.comparePassword1(pass1);
            const pass2Valid = await staff.comparePassword2(pass2);

            if (!pass1Valid || !pass2Valid) {
                req.flash('error', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            // 3. Login successful - update last login
            staff.lastLogin = new Date();
            await staff.save();

            // 4. Set session
            req.session.regenerate((err) => {
                if (err) {
                    console.error('Session regeneration error:', err);
                    req.flash('error', 'Login failed. Please try again.');
                    return res.redirect('/auth/login');
                }

                req.session.isAuthenticated = true;
                req.session.user = {
                    _id: staff._id,
                    username: staff.username,
                    role: staff.role,
                    email: staff.email
                };

                // Redirect to the dashboard
                res.redirect('/dashboard');
            });
        } catch (err) {
            console.error('Login error:', err);
            req.flash('error', 'An error occurred during login. Please try again.');
            return res.redirect('/auth/login');
        }
    });

    // Logout endpoint
    router.get('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.redirect('/dashboard'); // Or handle error appropriately
            }
            res.clearCookie('connect.sid'); // Clears the session cookie
            res.redirect('/auth/login');
        });
    });

    return router;
};
