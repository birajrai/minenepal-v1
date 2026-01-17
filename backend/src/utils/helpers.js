/**
 * Parses a comma-separated string of gamemodes into an array of strings.
 * Filters out any empty strings resulting from extra commas or leading/trailing commas.
 * @param {string} gamemodesString - The comma-separated string of gamemodes.
 * @returns {string[]} An array of trimmed gamemode strings.
 */
function parseGamemodes(gamemodesString) {
    if (!gamemodesString) {
        return [];
    }
    return gamemodesString.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Normalize a gamemode string for comparison.
 * Lowercases, trims, and removes spaces, underscores and hyphens.
 * Example: "Vanilla-1" -> "vanilla1"
 * @param {string} name
 * @returns {string}
 */
function normalizeGamemodeName(name) {
    if (!name || typeof name !== 'string') return '';
    return name.toLowerCase().trim().replace(/[\s_\-]+/g, '');
}

const axios = require('axios');

// Optimized in-memory cache for server status
const STATUS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const statusCache = new Map();
const pendingRequests = new Map();

// Cache cleanup to prevent memory leaks
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of statusCache.entries()) {
        if (now - value.ts > STATUS_CACHE_TTL) {
            statusCache.delete(key);
        }
    }
}, 10 * 60 * 1000); // Clean every 10 minutes

/**
 * Fetch Minecraft server status using mcsrvstat API.
 * Returns an object: { online: boolean, players: { online, max }, motd: string|null }
 */
async function fetchMcServerStatus(ip, port, serverType = 'java', options = {}) {
    if (!ip) return { online: false, players: { online: 0, max: 0 }, motd: null };
    // Use only the IP/hostname when querying mcsrvstat as requested (ignore provided port)
    const host = ip;

    // Always use the Java mcsrvstat endpoint. Bedrock checks removed because Geyser-backed
    // servers are reachable via the Java query and Bedrock-only checks are unnecessary.
    const url = `https://api.mcsrvstat.us/3/${host}`;

    // Cache per-host (Java-only)
    const cacheKey = `${host}`;

    const force = options && options.force === true;
    // Return cached value if fresh (unless force is requested)
    const cached = statusCache.get(cacheKey);
    const now = Date.now();
    if (!force && cached && (now - cached.ts) < STATUS_CACHE_TTL) {
        return cached.data;
    }

    // If a request is already pending for this key, await it (unless force)
    if (!force && pendingRequests.has(cacheKey)) {
        try {
            return await pendingRequests.get(cacheKey);
        } catch (e) {
            // fall through to attempt a fresh fetch
        }
    }

    // Make request and store pending promise to dedupe
    const p = (async () => {
        try {
            const resp = await axios.get(url, {
                timeout: 4000,
                headers: {
                    'User-Agent': 'MineNepal-ServerList/1.0 (+https://minenepal.xyz)'
                }
            });
            const data = resp.data || {};
            if (!data || data.online !== true) {
                const offline = { online: false, players: { online: 0, max: 0 }, motd: null };
                statusCache.set(cacheKey, { data: offline, ts: Date.now() });
                return offline;
            }

            const players = { online: 0, max: 0 };
            if (data.players) {
                players.online = Number(data.players.online) || 0;
                players.max = Number(data.players.max) || 0;
            }

            let motd = null;
            // icon/favicons: mcsrvstat may return a data-uri in `icon` or `favicon`
            let icon = null;
            if (data.icon && typeof data.icon === 'string') {
                icon = data.icon;
            } else if (data.favicon && typeof data.favicon === 'string') {
                icon = data.favicon;
            }
            if (data.motd) {
                if (Array.isArray(data.motd.clean) && data.motd.clean.length > 0) {
                    motd = data.motd.clean.join('\n');
                } else if (Array.isArray(data.motd.raw) && data.motd.raw.length > 0) {
                    motd = data.motd.raw.join('\n');
                } else if (typeof data.motd === 'string') {
                    motd = data.motd;
                }
            }

            const result = { online: true, players, motd, server_icon: icon };
            statusCache.set(cacheKey, { data: result, ts: Date.now() });
            return result;
        } catch (err) {
            const offline = { online: false, players: { online: 0, max: 0 }, motd: null };
            statusCache.set(cacheKey, { data: offline, ts: Date.now() });
            return offline;
        } finally {
            pendingRequests.delete(cacheKey);
        }
    })();

    pendingRequests.set(cacheKey, p);
    return p;
}

module.exports = {
    parseGamemodes
    , normalizeGamemodeName
    , fetchMcServerStatus
};
