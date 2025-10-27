import { Injectable } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CacheEntry<T> {
  data: Observable<T>;
  timestamp: number;
}

export interface CacheConfig {
  maxAge?: number; // Maximum age in milliseconds (default: no expiration)
  maxSize?: number; // Maximum number of cache entries (default: no limit)
}

@Injectable({
  providedIn: 'root',
})
export class HttpCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultConfig: CacheConfig = {
    maxAge: undefined,
    maxSize: undefined,
  };

  /**
   * Gets cached data or executes the request and caches the result
   * @param key - Unique cache key
   * @param request - Observable to execute if cache miss
   * @param config - Optional cache configuration
   * @returns Cached or fresh Observable
   */
  get<T>(
    key: string,
    request: Observable<T>,
    config: CacheConfig = this.defaultConfig,
  ): Observable<T> {
    const cached = this.cache.get(key);

    // Check if cache exists and is still valid
    if (cached && this.isCacheValid(cached, config.maxAge)) {
      return cached.data;
    }

    // Execute request and cache the result
    const shared = request.pipe(
      shareReplay(1),
      tap(() => {
        // Update cache timestamp after successful response
        const entry = this.cache.get(key);
        if (entry) {
          entry.timestamp = Date.now();
        }
      }),
    );

    // Store in cache
    this.cache.set(key, {
      data: shared,
      timestamp: Date.now(),
    });

    // Enforce max size if configured
    if (config.maxSize && this.cache.size > config.maxSize) {
      this.evictOldest();
    }

    return shared;
  }

  /**
   * Checks if a cache entry is still valid
   * @param entry - Cache entry to check
   * @param maxAge - Maximum age in milliseconds
   * @returns true if cache is valid
   */
  private isCacheValid<T>(entry: CacheEntry<T>, maxAge?: number): boolean {
    if (!maxAge) {
      return true; // No expiration configured
    }

    const age = Date.now() - entry.timestamp;
    return age < maxAge;
  }

  /**
   * Evicts the oldest cache entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Invalidates a specific cache entry
   * @param key - Cache key to invalidate
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidates all cache entries matching a pattern
   * @param pattern - RegExp pattern to match cache keys
   */
  invalidatePattern(pattern: RegExp): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (pattern.test(key)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * Clears all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the current cache size
   * @returns Number of cached entries
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Checks if a key exists in cache
   * @param key - Cache key to check
   * @returns true if key exists
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Gets all cache keys
   * @returns Array of cache keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}
