// Central Express server configuration
// Handles view engine, global middleware, authentication, and mounts all routers

const express = require('express');
const path = require('path');
const cors = require('cors');
const apicache = require('apicache');
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const WebSocket = require('ws');
const config = require('./config/config');
const { requireAuth, requireServersAccess, requireRankingsAccess } = require('./middleware/auth');

const app = express();
const PORT = 8080;
let httpServer = null;
let wss = null;
const wsClients = new Map();

// ===== Trust Proxy (MUST be set before rate limiters) =====
app.set('trust proxy', 1); // Trust first proxy

// ===== View Engine Setup =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== Rate Limiting =====
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Bypass rate limiting for requests from minenepal.xyz
        const origin = req.get('origin') || req.get('referer') || '';
        return origin.includes('minenepal.xyz');
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // Limit login attempts
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true,
});

// ===== Global Middleware =====
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const mongoSanitize = require('express-mongo-sanitize');

// Custom middleware to safely sanitize inputs
app.use((req, res, next) => {
  // Sanitize body and params
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);

  // Try to sanitize query, but catch errors if it's read-only (Express 5 issue)
  try {
    if (req.query) mongoSanitize.sanitize(req.query);
  } catch (err) {
    // If we can't sanitize query in-place, we might be in a strict environment.
    // In Express 5, req.query is a getter. We can try to modify the object it returns.
    // If that fails, we log it but don't crash.
    // Note: mongoSanitize modifies the object in-place, so if req.query returns a mutable object, it should work.
    // The error "Cannot set property query" implies the library tries to reassign req.query = ...
    // So we use the manual sanitize function which modifies in-place.
    console.warn('Warning: Could not sanitize req.query:', err.message);
  }
  next();
});

// Session middleware with optimized settings
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongoURI,
    touchAfter: 24 * 3600, // Lazy session update (24 hours)
    crypto: {
      secret: config.sessionSecret
    }
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax'
  }
}));

// Flash middleware
app.use(flash());

// Apply rate limiting to API routes
app.use('/api', apiLimiter);

// Cache middleware for API routes only
// app.use('/api', apicache.middleware('10 minutes'));

  // ===== Initialize Routes with Dependencies =====
  function initializeRoutes(UserInfo, bot) {
    // Import models
    const Staff = require('./models/staff');

    // Drop legacy index (userId_1) if it exists to prevent duplicate key errors
    (async () => {
      try {
        // Attempt to drop the index; ignore if not found
        await Staff.collection.dropIndex('userId_1');
        console.log('Dropped legacy index userId_1 from staffs collection');
      } catch (e) {
        const msg = e && e.message ? e.message : '';
        if (msg.toLowerCase().includes('index not found') || e.code === 27) {
          // Safe to ignore
        } else if (msg.toLowerCase().includes('not found')) {
          // ignore variations
        } else {
          console.warn('Could not drop legacy userId_1 index (may already be absent):', msg);
        }
      }
    })();

    // Import API routers (require UserInfo model)
    const usersRouter = require('./routes/api/users')(UserInfo);
    const leaderboardRouter = require('./routes/api/leaderboard')(UserInfo);
    const profileRouter = require('./api/profile')(UserInfo);
    const serversApiRouter = require('./api/servers');
    const serverApiRouter = require('./api/server');
    const voteApiRouter = require('./routes/api/vote')(UserInfo);
    const publicStatsRouter = require('./routes/api/public_stats')(bot);

    // Import dashboard routers
    const dashboardAuthRouter = require('./routes/dashboard/auth')(Staff);
    const dashboardServersRouter = require('./routes/dashboard/servers');
    const dashboardRankingsRouter = require('./routes/dashboard/rankings')(UserInfo);
    const dashboardUsersRouter = require('./routes/dashboard/users')(UserInfo);
    const dashboardBackupRouter = require('./routes/dashboard/backup');
    const dashboardStaffRouter = require('./routes/dashboard/staff')(Staff);
  // ===== Root Redirect =====
  app.get('/', (req, res) => {
    res.redirect('https://www.minenepal.xyz/');
  });

  // ===== Mount API Routes =====
  app.use('/api/users', usersRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/profile', profileRouter);
  app.use('/api/servers', serversApiRouter);
  app.use('/api/server', serverApiRouter);
  app.use('/api/vote', voteApiRouter);
  app.use('/api/public_stats', apicache.middleware('5 minutes'), publicStatsRouter);

  // ===== Mount Auth Routes (no auth required) =====
  app.use('/auth', authLimiter, dashboardAuthRouter);

  // ===== Mount Dashboard Routes =====
  const Server = require('./models/server');

  // Dashboard home page (requires auth) - with stats
  // Cache dashboard stats briefly (15s) to reduce DB load
  app.get('/dashboard', requireAuth, apicache.middleware('15 seconds'), async (req, res) => {
    try {
      // Fetch statistics
      const totalServers = await Server.countDocuments();
      const activeServers = await Server.countDocuments({ disabled: { $ne: true } });
      const totalUsers = await UserInfo.countDocuments();
      const usersWithPoints = await UserInfo.countDocuments({ 'points': { $ne: {} } });

      // Get top 5 players by total points using aggregation (computed server-side)
      const topPlayersPipeline = [
        { $match: { 'points': { $ne: {} } } },
        { $addFields: { totalPoints: { $sum: { $map: { input: { $objectToArray: '$points' }, in: '$$this.v' } } } } },
        { $match: { totalPoints: { $gt: 0 } } },
        { $sort: { totalPoints: -1 } },
        { $limit: 5 },
        { $project: { discordId: 1, minecraftName: 1, totalPoints: 1 } }
      ];

      const usersWithTotalPoints = await UserInfo.aggregate(topPlayersPipeline).exec();

      res.render('dashboard/home', {
        user: req.session.user,
        error: null,
        stats: {
          totalServers,
          activeServers,
          totalUsers,
          usersWithPoints,
          topPlayers: usersWithTotalPoints
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.render('dashboard/home', {
        user: req.session.user,
        stats: null,
        error: 'Failed to load statistics'
      });
    }
  });

  // Protected dashboard routes (all require auth)
  app.use('/dashboard/servers', requireServersAccess, dashboardServersRouter);
  app.use('/dashboard/rankings', requireRankingsAccess, dashboardRankingsRouter);
  app.use('/dashboard/users', requireRankingsAccess, dashboardUsersRouter);
  app.use('/dashboard/backup', requireAuth, dashboardBackupRouter);
  app.use('/dashboard/staff', requireAuth, dashboardStaffRouter);

  console.log('✓ All routes initialized successfully');

  // 404 handler
  app.use((req, res, next) => {
    res.status(404);
    if (req.path.startsWith('/api')) {
      return res.json({ error: 'Not found' });
    }
    // For UI routes, render a minimal 404 page if available, otherwise send text
    try {
      return res.render('404', { url: req.originalUrl, user: req.session && req.session.user });
    } catch (err) {
      return res.send('404 - Not Found');
    }
  });

  // Error-handling middleware (centralized)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('Unhandled error:', err && err.stack ? err.stack : err);
    // If headers already sent, delegate to default handler
    if (res.headersSent) {
      return next(err);
    }

    if (req.path.startsWith('/api')) {
      return res.status(500).json({ error: 'Internal server error' });
    }

    // For UI render a simple error page if available
    try {
      return res.status(500).render('error', { error: 'Internal server error', details: (process.env.NODE_ENV !== 'production') ? (err && err.message) : null, user: req.session && req.session.user });
    } catch (renderErr) {
      return res.status(500).send('500 - Internal server error');
    }
  });
}

// ===== WebSocket Functions =====
function initializeWebSocket(server) {
  wss = new WebSocket.Server({ 
    server,
    path: '/votews',
    maxPayload: 50 * 1024
  });

  // WebSocket server initialized (debug log removed)

  wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;

    wsClients.set(ws, { authenticated: false, serverId: null });
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWSMessage(ws, message);
      } catch (error) {
        console.error('[VoteWS] Error parsing message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' }));
      }
    });

    ws.on('close', () => {
      wsClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('[VoteWS] WebSocket error:', error);
      wsClients.delete(ws);
    });
  });

  // Heartbeat
  const heartbeatInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        // Dead connection terminated (debug log removed)
        wsClients.delete(ws);
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(heartbeatInterval);
  });
}

function handleWSMessage(ws, message) {
  const { type } = message;

  switch (type) {
    case 'auth':
      handleWSAuth(ws, message);
      break;
    case 'pong':
      break;
    default:
      // Unknown message type received (debug log removed)
      ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
  }
}

function handleWSAuth(ws, message) {
  let { secret, serverId } = message;
  const Server = require('./models/server');
  
  // Trim values to handle whitespace
  secret = secret ? secret.trim() : '';
  serverId = serverId ? serverId.trim() : '';
  
  // Auth attempt (debug details removed)
  
  // Check if server exists in database
  Server.findOne({ slug: serverId })
    .then(serverCheck => {
      if (!serverCheck) {
        // Server not found (debug log removed)
        ws.send(JSON.stringify({ type: 'auth_failed', message: 'Server not found' }));
        ws.close();
        return;
      }
      
      const dbSecret = serverCheck.secret ? serverCheck.secret.trim() : '';
      // Server found (debug details removed)
      
      // Check if secret matches
      if (dbSecret !== secret) {
        // Secret mismatch (debug log removed)
        ws.send(JSON.stringify({ type: 'auth_failed', message: 'Invalid secret' }));
        ws.close();
        return;
      }
      
      // Authentication successful
      const clientData = wsClients.get(ws);
      if (clientData) {
        clientData.authenticated = true;
        clientData.serverId = serverId;
        // Client authenticated (debug log removed)
        ws.send(JSON.stringify({ type: 'auth_success', message: 'Authenticated', serverId: serverId }));
      }
    })
    .catch(err => {
      console.error('[VoteWS] Database error during auth:', err);
      ws.send(JSON.stringify({ type: 'auth_failed', message: 'Database error' }));
      ws.close();
    });
}

function broadcastVote(voteData) {
  const message = JSON.stringify({
    type: 'vote',
    ...voteData
  });

  const targetServer = voteData.server; // The server slug they voted for
  let sentCount = 0;
  
  wsClients.forEach((clientData, ws) => {
    if (clientData.authenticated && ws.readyState === WebSocket.OPEN) {
      // Only send to the server they voted for
      if (clientData.serverId === targetServer) {
        try {
          ws.send(message);
          sentCount++;
        } catch (error) {
          console.error('[VoteWS] Error sending vote to client:', error);
        }
      }
    }
  });

  // Vote broadcast completed (debug log removed)
  return sentCount;
}

function getWSStatus() {
  return {
    running: wss !== null,
    totalConnections: wss ? wss.clients.size : 0,
    authenticatedClients: Array.from(wsClients.values()).filter(c => c.authenticated).length
  };
}

// ===== Start Server =====
function start() {
  httpServer = app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
  });

  // Attach WebSocket to the same HTTP server
  initializeWebSocket(httpServer);

  return httpServer;
}

function stop() {
  if (wss) {
    wss.clients.forEach(ws => ws.close());
    wss.close();
  }
  if (httpServer) {
    httpServer.close();
  }
  wsClients.clear();
}

module.exports = { app, initializeRoutes, start, stop, broadcastVote, getWSStatus };
