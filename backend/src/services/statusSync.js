const mongoose = require('mongoose');
const Server = require('../models/server');
const { fetchMcServerStatus } = require('../utils/helpers');
require('dotenv').config();

const SYNC_INTERVAL = parseInt(process.env.STATUS_SYNC_INTERVAL_MS || '300000', 10); // Default 5 minutes
const BATCH_SIZE = 10; // Process servers in batches to avoid overwhelming the network

/**
 * Sync server status from live queries to MongoDB
 * This runs as a background job to keep status data fresh
 */
async function syncServerStatus() {
    const startTime = Date.now();
    
    try {
        // Get all enabled servers
        const servers = await Server.find({ disabled: { $ne: true } }, 'slug ip port server_type').lean();
        
        if (!servers || servers.length === 0) {
            return;
        }

        const updates = [];
        
        // Process servers in batches
        for (let i = 0; i < servers.length; i += BATCH_SIZE) {
            const batch = servers.slice(i, i + BATCH_SIZE);
            
            const batchPromises = batch.map(async (server) => {
                try {
                    const serverType = (server.server_type || '').toString().toLowerCase();
                    const isJava = serverType.includes('java');
                    
                    if (!isJava) {
                        return {
                            updateOne: {
                                filter: { slug: server.slug },
                                update: {
                                    $set: {
                                        online: false,
                                        players: 0,
                                        maxPlayers: 0,
                                        lastStatusSync: new Date()
                                    }
                                }
                            }
                        };
                    }

                    const status = await fetchMcServerStatus(server.ip, server.port, 'java');
                    
                    return {
                        updateOne: {
                            filter: { slug: server.slug },
                            update: {
                                $set: {
                                    online: status.online || false,
                                    players: status.players?.online || 0,
                                    maxPlayers: status.players?.max || 0,
                                    lastStatusSync: new Date()
                                }
                            }
                        }
                    };
                } catch (error) {
                    // If status check fails, mark as offline
                    return {
                        updateOne: {
                            filter: { slug: server.slug },
                            update: {
                                $set: {
                                    online: false,
                                    players: 0,
                                    maxPlayers: 0,
                                    lastStatusSync: new Date()
                                }
                            }
                        }
                    };
                }
            });

            const batchUpdates = await Promise.all(batchPromises);
            updates.push(...batchUpdates);
            
            // Small delay between batches to avoid rate limiting
            if (i + BATCH_SIZE < servers.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        // Bulk write all updates
        if (updates.length > 0) {
            await Server.bulkWrite(updates, { ordered: false });
        }

        const duration = Date.now() - startTime;
        // Silent success - no logging in production
    } catch (error) {
        // Silent error handling - only critical errors should be logged
    }
}

/**
 * Start the sync service
 */
async function startSyncService() {
    // Connect to MongoDB if not already connected
    if (mongoose.connection.readyState === 0) {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            process.exit(1);
        }
        await mongoose.connect(mongoUri);
    }

    // Run initial sync
    await syncServerStatus();

    // Schedule periodic syncs
    setInterval(syncServerStatus, SYNC_INTERVAL);
}

// If run directly (not imported)
if (require.main === module) {
    startSyncService().catch((error) => {
        process.exit(1);
    });
}

module.exports = { syncServerStatus, startSyncService };
