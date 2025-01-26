export interface RateLimitOptions {

    interval: number;
  
    uniqueTokenPerInterval: number;
  
  }
  
  
  
  export function rateLimit(options: RateLimitOptions) {
  
    const tokenCache = new Map();
  
    let lastReset = Date.now();
  
  
  
    return {
  
      check: async (req: Request, p0: number, token: string) => {
  
        const now = Date.now();
  
        if (now - lastReset >= options.interval) {
  
          tokenCache.clear();
  
          lastReset = now;
  
        }
  
  
  
        const count = (tokenCache.get(token) || 0) + 1;
  
        tokenCache.set(token, count);
  
  
  
        return count <= options.uniqueTokenPerInterval;
  
      },
  
    };
  
  }