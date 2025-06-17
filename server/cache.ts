import Redis from "ioredis";

// In-memory cache fallback for development
class MemoryCache {
  private cache = new Map<string, { value: any; expires: number }>();
  
  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return JSON.stringify(item.value);
  }
  
  async set(key: string, value: string, mode?: string, duration?: number): Promise<string> {
    const expires = Date.now() + (duration ? duration * 1000 : 3600000); // 1 hour default
    this.cache.set(key, { value: JSON.parse(value), expires });
    return "OK";
  }
  
  async del(key: string): Promise<number> {
    return this.cache.delete(key) ? 1 : 0;
  }
  
  async exists(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) return 0;
    return 1;
  }
  
  async flushall(): Promise<string> {
    this.cache.clear();
    return "OK";
  }
}

// Create cache instance
export const cache = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : new MemoryCache() as any;

// Cache utilities
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const cached = await cache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  try {
    await cache.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.warn("Cache set failed:", error);
  }
}

export async function deleteCached(key: string): Promise<void> {
  try {
    await cache.del(key);
  } catch (error) {
    console.warn("Cache delete failed:", error);
  }
}

export async function cacheExists(key: string): Promise<boolean> {
  try {
    return (await cache.exists(key)) === 1;
  } catch {
    return false;
  }
}