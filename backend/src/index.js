"use strict";

const mongoose = require('mongoose');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const bot = require('./bot/bot');
const webServer = require('./web');
const UserInfo = require('./models/userInfo');
const ServerModel = require('./models/server');
const Staff = require('./models/staff');
const VoteCooldown = require('./models/voteCooldown');
const config = require('./config/config');

bot.config = config;

// Validate required config values
const requiredConfig = ['mongoURI', 'token', 'guildId'];
for (const key of requiredConfig) {
    if (!config[key]) {
        console.error(`Missing required config value: ${key}`);
        process.exit(1);
    }
}

// MongoDB connection with optimized settings and connection pooling
const mongooseOptions = {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(config.mongoURI, mongooseOptions).then(async () => {
    console.log('Connected to MongoDB');

    // Drop legacy staffs index if present (userId_1)
    try {
        const indexes = await Staff.collection.indexes();
        const legacy = indexes.find(i => i.key && i.key.userId === 1);
        if (legacy) {
            await Staff.collection.dropIndex('userId_1');
            console.log('Dropped legacy index userId_1 from staffs collection');
        }
    } catch (e) {
        const msg = e && e.message ? e.message : '';
        if (!/not found/i.test(msg)) {
            console.warn('Index check/drop warning for staffs.userId_1:', msg);
        }
    }

    // Start the bot only after MongoDB is connected
    try {
        await bot.login(config.token);
    } catch (error) {
        console.error('Failed to login to Discord:', error);
        process.exit(1);
    }
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected successfully');
});

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);

    try {
        // Cleanup bot intervals
        if (bot.cleanup) bot.cleanup();

        // Stop staggered server status prefetch loop if running
        if (global.__serverStatusPrefetchStop) {
            try { global.__serverStatusPrefetchStop(); } catch (e) { /* ignore */ }
        }

        // Stop web server and WebSocket
        try {
            webServer.stop();
        } catch (e) { /* ignore */ }

        // Destroy the bot connection
        bot.destroy();
        console.log('Bot logged out successfully');

        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');

        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

bot.once("clientReady", async () => {
    console.log("PvP Tierlist is running.");

    // Initialize and start the web server (WebSocket is now integrated)
    webServer.initializeRoutes(UserInfo, bot);
    webServer.start();

    // Start the background server status sync service
    try {
        const { startSyncService } = require('./services/statusSync');
        await startSyncService();
        console.log('Server status sync service started');
    } catch (err) {
        console.error('Failed to start status sync service:', err);
    }

    // Ensure the bot is only in authorized guilds and register commands
    const authorizedGuilds = bot.config.guildIds || [bot.config.guildId];

    for (const [guildId, guild] of bot.guilds.cache) {
        if (!authorizedGuilds.includes(guildId)) {
            console.log(`Leaving unauthorized guild: ${guild.name} (${guildId})`);
            try {
                await guild.leave();
            } catch (error) {
                console.error(`Failed to leave guild ${guildId}:`, error);
            }
        }
    }

    // Register commands to all authorized guilds
    const rest = new REST({ version: '10' }).setToken(config.token);

    for (const guildId of authorizedGuilds) {
        try {
            const guild = await bot.guilds.fetch(guildId);
            if (guild) {
                try {
                    await rest.put(
                        Routes.applicationGuildCommands(bot.user.id, guild.id),
                        { body: bot.commands.map(command => command.data.toJSON()) }
                    );
                    console.log(`Successfully registered ${bot.commands.size} commands to guild ${guild.name}`);
                } catch (error) {
                    console.error(`Failed to register commands for guild ${guildId}:`, error);
                }
            } else {
                console.error(`Guild not found: ${guildId}. Check guildIds in config.js.`);
            }
        } catch (error) {
            console.error(`Failed to fetch guild ${guildId}:`, error);
        }
    }
});