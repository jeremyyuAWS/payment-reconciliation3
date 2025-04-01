// Simple in-memory cache implementation for improved performance

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items in cache
}

export class DataCache<T> {
  private cache: Map<string, { value: T; timestamp: number }>;
  private options: Required<CacheOptions>;
  private hits: number = 0;
  private misses: number = 0;
  
  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl || 5 * 60 * 1000, // Default: 5 minutes
      maxSize: options.maxSize || 100 // Default: 100 items
    };
    this.cache = new Map();
  }
  
  /**
   * Set a value in the cache
   */
  set(key: string, value: T): void {
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.options.maxSize) {
      const oldestKey = this.findOldestKey();
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * Get a value from the cache
   * Returns undefined if not found or expired
   */
  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return undefined;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      this.misses++;
      return undefined;
    }
    
    this.hits++;
    return entry.value;
  }
  
  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Remove a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests === 0 ? 0 : (this.hits / totalRequests) * 100;
    
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      ttl: this.options.ttl,
      hits: this.hits,
      misses: this.misses,
      hitRate: hitRate,
      items: Array.from(this.cache.keys())
    };
  }
  
  /**
   * Find the oldest key in the cache
   */
  private findOldestKey(): string | undefined {
    let oldestTime = Infinity;
    let oldestKey: string | undefined;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    return oldestKey;
  }
}

// Singleton instance for app-wide cached data
export const globalCache = new DataCache<any>({
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 500
});