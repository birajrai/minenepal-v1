const WebSocket = require('ws');
const config = require('../config/config');

class VoteWebSocketServer {
    constructor() {
        this.wss = null;
        this.clients = new Map(); // Map of authenticated clients: ws -> { serverId, authenticated }
    }

    start(port = 8081) {
        try {
            this.wss = new WebSocket.Server({ 
                port,
                maxPayload: 50 * 1024 // 50KB max message size
            });

            console.log(`Vote WebSocket server listening on ws://localhost:${port}`);

            this.wss.on('connection', (ws, req) => {
                try {
                    const clientIp = req.socket.remoteAddress;
                    console.log(`[VoteWS] New connection from ${clientIp}`);

                    // Set client as unauthenticated initially
                    this.clients.set(ws, { authenticated: false, serverId: null });

                    // Set up ping/pong for connection health
                    ws.isAlive = true;
                    ws.on('pong', () => { ws.isAlive = true; });

                    ws.on('message', (data) => {
                        try {
                            const message = JSON.parse(data.toString());
                            this.handleMessage(ws, message);
                        } catch (error) {
                            console.error('[VoteWS] Error parsing message:', error);
                            try { ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON' })); } catch (e) {}
                        }
                    });

                    ws.on('close', () => {
                        try {
                            console.log(`[VoteWS] Client disconnected from ${clientIp}`);
                            this.clients.delete(ws);
                        } catch (e) { console.error('[VoteWS] Error on close:', e); }
                    });

                    ws.on('error', (error) => {
                        console.error('[VoteWS] WebSocket error:', error);
                        try { this.clients.delete(ws); } catch (e) {}
                    });
                } catch (e) {
                    console.error('[VoteWS] Error in connection handler:', e);
                }
            });

            // Heartbeat to detect broken connections
            this.heartbeatInterval = setInterval(() => {
                try {
                    this.wss.clients.forEach((ws) => {
                        try {
                            if (ws.isAlive === false) {
                                console.log('[VoteWS] Terminating dead connection');
                                this.clients.delete(ws);
                                return ws.terminate();
                            }
                            ws.isAlive = false;
                            ws.ping();
                        } catch (e) { console.error('[VoteWS] Heartbeat error:', e); }
                    });
                } catch (e) { console.error('[VoteWS] Heartbeat interval error:', e); }
            }, 30000); // every 30 seconds

            this.wss.on('error', (error) => {
                console.error('[VoteWS] Server error:', error);
            });
        } catch (e) {
            console.error('[VoteWS] Fatal error starting server:', e);
        }
    }

    handleMessage(ws, message) {
        try {
            const { type } = message;
            switch (type) {
                case 'auth':
                    this.handleAuth(ws, message);
                    break;
                case 'pong':
                    // Client responded to ping
                    break;
                default:
                    console.log('[VoteWS] Unknown message type:', type);
                    try { ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' })); } catch (e) {}
            }
        } catch (e) {
            console.error('[VoteWS] Error in handleMessage:', e);
            try { ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' })); } catch (err) {}
        }
    }

    handleAuth(ws, message) {
        try {
            let { secret, serverId } = message;
            const Server = require('../models/server');
            
            // Trim values to handle whitespace
            secret = secret ? secret.trim() : '';
            serverId = serverId ? serverId.trim() : '';
            
            console.log(`[VoteWS] Auth attempt - serverId: "${serverId}", secret length: ${secret.length}`);
            
            // First check if server exists at all
            Server.findOne({ slug: serverId })
                .then(serverCheck => {
                    if (!serverCheck) {
                        console.warn(`[VoteWS] Server not found with slug: ${serverId}`);
                        try { ws.send(JSON.stringify({ type: 'auth_failed', message: 'Server not found' })); } catch (e) {}
                        try { ws.close(); } catch (e) {}
                        return;
                    }
                    
                    const dbSecret = serverCheck.secret ? serverCheck.secret.trim() : '';
                    console.log(`[VoteWS] Server found. DB secret length: ${dbSecret.length}, incoming secret length: ${secret.length}`);
                    
                    // Now check if secret matches
                    if (dbSecret !== secret) {
                        console.warn(`[VoteWS] Secret mismatch for ${serverId}. Expected length: ${dbSecret.length}, got: ${secret.length}`);
                        try { ws.send(JSON.stringify({ type: 'auth_failed', message: 'Invalid secret' })); } catch (e) {}
                        try { ws.close(); } catch (e) {}
                        return;
                    }
                    
                    // Authentication successful
                    const clientData = this.clients.get(ws);
                    if (clientData) {
                        clientData.authenticated = true;
                        clientData.serverId = serverId || 'unknown';
                        console.log(`[VoteWS] Client authenticated successfully as server: ${serverId}`);
                        try { ws.send(JSON.stringify({ type: 'auth_success', message: 'Authenticated', serverId: serverId })); } catch (e) {}
                    }
                })
                .catch(err => {
                    console.error('[VoteWS] Database error during auth:', err);
                    try { ws.send(JSON.stringify({ type: 'auth_failed', message: 'Database error' })); } catch (e) {}
                    try { ws.close(); } catch (e) {}
                });
        } catch (e) {
            console.error('[VoteWS] Error in handleAuth:', e);
            try { ws.send(JSON.stringify({ type: 'error', message: 'Internal server error' })); } catch (err) {}
        }
    }

    /**
     * Broadcast a vote event to specific server or all authenticated Minecraft servers
     * @param {Object} voteData - { username, uuid, server, time, discordId }
     */
    broadcastVote(voteData) {
        let sentCount = 0;
        try {
            const message = JSON.stringify({
                type: 'vote',
                ...voteData
            });

            const targetServer = voteData.server; // The server slug they voted for
            this.clients.forEach((clientData, ws) => {
                try {
                    if (clientData.authenticated && ws.readyState === WebSocket.OPEN) {
                        // Only send to the server they voted for
                        if (clientData.serverId === targetServer) {
                            ws.send(message);
                            sentCount++;
                        }
                    }
                } catch (error) {
                    console.error('[VoteWS] Error sending vote to client:', error);
                }
            });
            console.log(`[VoteWS] Broadcasted vote for ${voteData.username} to ${sentCount} server(s) (target: ${targetServer})`);
        } catch (e) {
            console.error('[VoteWS] Error in broadcastVote:', e);
        }
        return sentCount;
    }

    stop() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        if (this.wss) {
            this.wss.clients.forEach(ws => ws.close());
            this.wss.close(() => {
                console.log('[VoteWS] WebSocket server stopped');
            });
        }

        this.clients.clear();
    }

    getStatus() {
        return {
            running: this.wss !== null,
            totalConnections: this.wss ? this.wss.clients.size : 0,
            authenticatedClients: Array.from(this.clients.values()).filter(c => c.authenticated).length
        };
    }
}

// Singleton instance
const voteWebSocketServer = new VoteWebSocketServer();

module.exports = voteWebSocketServer;
