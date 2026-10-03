interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cacheStore = new Map<string, CacheEntry<any>>();

/**
 * In-memory server-side cache with TTL in milliseconds (default 10 minutes).
 */
export async function getOrSetCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 10 * 60 * 1000
): Promise<T> {
  const cached = cacheStore.get(key);
  const now = Date.now();

  if (cached && now - cached.timestamp < ttlMs) {
    return cached.data;
  }

  try {
    const data = await fetcher();
    cacheStore.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    // If fetch fails but we have stale cache, return it as fallback
    if (cached) {
      console.warn(`[EventCache] Fetch failed for "${key}", returning stale cache:`, error);
      return cached.data;
    }
    throw error;
  }
}

/**
 * Clear the cache manually if needed.
 */
export function clearEventCache(): void {
  cacheStore.clear();
}
