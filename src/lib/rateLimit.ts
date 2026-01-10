/**
 * In-Memory Rate Limiter
 * 
 * Simple sliding window rate limiter for API protection.
 * For production scale, consider upgrading to Redis-based solution (e.g., @upstash/ratelimit).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 20; // Max 20 requests per minute per IP

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

let cleanupTimer: NodeJS.Timeout | null = null;

function startCleanup() {
    if (cleanupTimer) return;
    
    cleanupTimer = setInterval(() => {
        const now = Date.now();
        const entries = Array.from(rateLimitStore.entries());
        for (const [key, entry] of entries) {
            if (now > entry.resetTime) {
                rateLimitStore.delete(key);
            }
        }
    }, CLEANUP_INTERVAL);
    
    // Don't prevent process exit
    if (cleanupTimer.unref) {
        cleanupTimer.unref();
    }
}

export interface RateLimitResult {
    success: boolean;
    remaining: number;
    resetTime: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (usually IP address or user ID)
 * @returns Rate limit result with remaining requests
 */
export function checkRateLimit(identifier: string): RateLimitResult {
    startCleanup();
    
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);
    
    // No existing entry or window expired
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime: now + WINDOW_MS,
        });
        return {
            success: true,
            remaining: MAX_REQUESTS - 1,
            resetTime: now + WINDOW_MS,
        };
    }
    
    // Within window, check limit
    if (entry.count >= MAX_REQUESTS) {
        return {
            success: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }
    
    // Increment counter
    entry.count++;
    return {
        success: true,
        remaining: MAX_REQUESTS - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
    return {
        'X-RateLimit-Limit': String(MAX_REQUESTS),
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
    };
}
