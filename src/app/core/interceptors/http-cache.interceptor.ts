import { HttpInterceptorFn, HttpContext, HttpContextToken } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpCacheService, CacheConfig } from '../services/http-cache.service';

/**
 * HTTP Context token to enable/disable caching for specific requests
 */
export const CACHE_ENABLED = new HttpContextToken<boolean>(() => false);

/**
 * HTTP Context token to configure cache settings for specific requests
 */
export const CACHE_CONFIG = new HttpContextToken<CacheConfig>(() => ({}));

/**
 * HTTP Context token to provide a custom cache key
 */
export const CACHE_KEY = new HttpContextToken<string | undefined>(() => undefined);

/**
 * HTTP Cache Interceptor
 * Automatically caches GET requests when caching is enabled via HttpContext
 */
export const httpCacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);

  // Only cache GET requests and when explicitly enabled
  const isCacheEnabled = req.context.get(CACHE_ENABLED);
  if (req.method !== 'GET' || !isCacheEnabled) {
    return next(req);
  }

  // Get cache configuration from context
  const cacheConfig = req.context.get(CACHE_CONFIG);
  const customKey = req.context.get(CACHE_KEY);

  // Generate cache key (custom or URL-based)
  const cacheKey = customKey || generateCacheKey(req.urlWithParams);

  // Check if we have a cached response
  const cachedEntry = cacheService.has(cacheKey)
    ? cacheService.get(cacheKey, next(req), cacheConfig)
    : null;

  if (cachedEntry) {
    return cachedEntry;
  }

  // Cache the response
  return cacheService.get(cacheKey, next(req), cacheConfig);
};

/**
 * Generates a cache key from the request URL
 * @param url - Request URL with params
 * @returns Cache key string
 */
function generateCacheKey(url: string): string {
  return `http-cache:${url}`;
}

/**
 * Helper function to create cache-enabled HTTP context
 * @param config - Optional cache configuration
 * @param customKey - Optional custom cache key
 * @returns HttpContext with cache settings
 */
export function withCache(config?: CacheConfig, customKey?: string): HttpContext {
  let context = new HttpContext().set(CACHE_ENABLED, true);

  if (config) {
    context = context.set(CACHE_CONFIG, config);
  }

  if (customKey) {
    context = context.set(CACHE_KEY, customKey);
  }

  return context;
}
