/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

// Base API URL - server-side only, never exposed to client
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    throw new Error('API_BASE_URL should not be accessed on client side');
  }
  return process.env.HEART_API_URL || 'https://heart.minenepal.xyz';
};

// Lazy evaluation to prevent errors during module loading
let _cachedApiBaseUrl: string | null = null;
export const API_BASE_URL = () => {
  if (_cachedApiBaseUrl === null) {
    _cachedApiBaseUrl = getApiBaseUrl();
  }
  return _cachedApiBaseUrl;
};

/**
 * API Endpoints
 */
export const API_ENDPOINTS = {
  // Server endpoints
  servers: () => `${API_BASE_URL()}/api/servers`,
  server: (slug: string) => `${API_BASE_URL()}/api/server/${slug}`,
  
  // Leaderboard endpoints
  leaderboard: () => `${API_BASE_URL()}/api/leaderboard`,
  gamemodeLeaderboard: (gamemode: string) => `${API_BASE_URL()}/api/leaderboard/${gamemode.toUpperCase()}`,
  
  // Player endpoints
  player: (minecraftName: string) => `${API_BASE_URL()}/api/player/${minecraftName}`,
  
  // User endpoints
  user: (discordId: string) => `${API_BASE_URL()}/api/users/${discordId}`,
  
  // Vote endpoints
  vote: () => `${API_BASE_URL()}/api/vote`,
  voteCooldown: () => `${API_BASE_URL()}/api/vote/cooldown`,
  voteHistory: (slug: string) => `${API_BASE_URL()}/api/vote/history/${slug}`,
  
  // Auth endpoints
  authVerify: () => `${API_BASE_URL()}/api/auth/verify`,
  
  // Admin endpoints
  adminForceUpdate: () => `${API_BASE_URL()}/api/admin/forceupdate/all`,
  
  // Contact endpoint
  contact: () => `${API_BASE_URL()}/api/contact`,
} as const;

/**
 * Cache/Revalidation times (in seconds)
 */
export const CACHE_TIMES = {
  servers: 300,        // 5 minutes (matches backend sync interval)
  server: 300,         // 5 minutes (matches backend sync interval)
  leaderboard: 300,    // 5 minutes (fast updates for rankings)
  player: 600,         // 10 minutes (user data changes less frequently)
  user: 300,           // 5 minutes
} as const;
