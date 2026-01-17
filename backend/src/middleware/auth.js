// src/middleware/auth.js
// Authentication middleware for dashboard routes with role-based access control

/**
 * Middleware to require authentication via session.
 * Checks if a user is authenticated.
 */
function requireAuth(req, res, next) {
    if (req.session.isAuthenticated && req.session.user) {
        return next();
    }

    // Redirect to login page if not authenticated
    return res.redirect('/auth/login');
}

/**
 * Middleware to require Owner role.
 * Only Owners can access routes protected by this middleware.
 */
function requireOwner(req, res, next) {
    if (!req.session.isAuthenticated || !req.session.user) {
        return res.redirect('/auth/login');
    }

    if (req.session.user.role !== 'Owner') {
        req.flash('error', 'You do not have permission to access this resource');
        return res.redirect('/dashboard');
    }

    return next();
}

/**
 * Middleware to require Servers Manager or Owner role.
 * Used for server management routes.
 */
function requireServersAccess(req, res, next) {
    if (!req.session.isAuthenticated || !req.session.user) {
        return res.redirect('/auth/login');
    }

    const allowedRoles = ['Owner', 'Servers Manager'];
    if (!allowedRoles.includes(req.session.user.role)) {
        req.flash('error', 'You do not have permission to access this resource');
        return res.redirect('/dashboard');
    }

    return next();
}

/**
 * Middleware to require Rankings Manager or Owner role.
 * Used for rankings and user management routes.
 */
function requireRankingsAccess(req, res, next) {
    if (!req.session.isAuthenticated || !req.session.user) {
        return res.redirect('/auth/login');
    }

    const allowedRoles = ['Owner', 'Rankings Manager'];
    if (!allowedRoles.includes(req.session.user.role)) {
        req.flash('error', 'You do not have permission to access this resource');
        return res.redirect('/dashboard');
    }

    return next();
}

module.exports = {
    requireAuth,
    requireOwner,
    requireServersAccess,
    requireRankingsAccess
};

