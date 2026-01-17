/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is within rate limits
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let store = rateLimitMap.get(key);

  // Initialize or reset if expired
  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + config.interval,
    };
    rateLimitMap.set(key, store);
  }

  // Increment count
  store.count++;

  // Check if limit exceeded
  const success = store.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - store.count);

  return {
    success,
    remaining,
    resetTime: store.resetTime,
  };
}

/**
 * Get client identifier from request
 * @param request - Next.js request object
 * @returns Client identifier (IP or fallback)
 */
export function getClientIdentifier(request: Request): string {
  const headers = new Headers(request.headers);
  
  // Try to get real IP from various headers
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Strict rate limit for authentication endpoints
  AUTH: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 5,
  },
  // Moderate rate limit for API endpoints
  API: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 30,
  },
  // Lenient rate limit for public read endpoints
  PUBLIC: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 60,
  },
  // Very strict for voting
  VOTE: {
    interval: 60 * 1000, // 1 minute
    maxRequests: 3,
  },
  // Contact form
  CONTACT: {
    interval: 5 * 60 * 1000, // 5 minutes
    maxRequests: 2,
  },
} as const;
