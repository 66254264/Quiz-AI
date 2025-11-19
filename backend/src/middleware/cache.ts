import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory cache for API responses
 */
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

class ResponseCache {
  private cache: Map<string, CacheEntry>;

  constructor() {
    this.cache = new Map();
  }

  /**
   * Generate cache key from request
   */
  private generateKey(req: Request): string {
    const { method, originalUrl, user } = req;
    const userId = user?.userId || 'anonymous';
    return `${method}:${originalUrl}:${userId}`;
  }

  /**
   * Get cached response
   */
  get(req: Request): any | null {
    const key = this.generateKey(req);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.expiresIn;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cached response
   */
  set(req: Request, data: any, ttl: number): void {
    const key = this.generateKey(req);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      expiresIn: ttl,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear cache entries matching pattern
   */
  invalidatePattern(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  clearExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      const isExpired = now - entry.timestamp > entry.expiresIn;
      if (isExpired) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const responseCache = new ResponseCache();

// Periodically clear expired entries (every 5 minutes)
setInterval(() => {
  responseCache.clearExpired();
}, 5 * 60 * 1000);

/**
 * Cache TTL constants (in milliseconds)
 */
export const CacheTTL = {
  SHORT: 1 * 60 * 1000,      // 1 minute
  MEDIUM: 5 * 60 * 1000,     // 5 minutes
  LONG: 15 * 60 * 1000,      // 15 minutes
  VERY_LONG: 60 * 60 * 1000, // 1 hour
};

/**
 * Middleware to cache GET requests
 */
export const cacheMiddleware = (ttl: number = CacheTTL.MEDIUM) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Check if response is cached
    const cachedData = responseCache.get(req);
    
    if (cachedData) {
      console.log(`Cache hit: ${req.originalUrl}`);
      return res.json(cachedData);
    }

    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to cache response
    res.json = function(data: any) {
      // Only cache successful responses
      if (data.success !== false) {
        responseCache.set(req, data, ttl);
        console.log(`Cached: ${req.originalUrl} (TTL: ${ttl}ms)`);
      }
      
      return originalJson(data);
    };

    next();
  };
};

/**
 * Middleware to invalidate cache on mutations
 */
export const invalidateCacheMiddleware = (pattern: RegExp) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json method to invalidate cache after successful mutation
    res.json = function(data: any) {
      // Invalidate cache if mutation was successful
      if (data.success !== false) {
        responseCache.invalidatePattern(pattern);
        console.log(`Cache invalidated: ${pattern}`);
      }
      
      return originalJson(data);
    };

    next();
  };
};
