import type { Request, Response, NextFunction } from "express"

export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
}

interface RequestEntry {
  timestamps: number[]
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60000,
  maxRequests: 60,
}

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config }
  const clients = new Map<string, RequestEntry>()

  // Periodically clean up expired entries to prevent memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [ip, entry] of clients) {
      // Remove timestamps older than the window
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs)
      if (entry.timestamps.length === 0) {
        clients.delete(ip)
      }
    }
  }, windowMs)

  // Allow the timer to not block process exit
  if (cleanupInterval.unref) {
    cleanupInterval.unref()
  }

  return function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ip = req.ip || "unknown"
    const now = Date.now()

    let entry = clients.get(ip)
    if (!entry) {
      entry = { timestamps: [] }
      clients.set(ip, entry)
    }

    // Remove timestamps outside the current window (sliding window)
    entry.timestamps = entry.timestamps.filter((ts) => now - ts >= 0 && now - ts < windowMs)

    if (entry.timestamps.length >= maxRequests) {
      // Calculate seconds until the oldest timestamp in the window expires
      const oldestTimestamp = entry.timestamps[0]
      const retryAfterMs = windowMs - (now - oldestTimestamp)
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)

      res.setHeader("Retry-After", String(retryAfterSeconds))
      res.status(429).json({ message: "Rate limit exceeded" })
      return
    }

    // Record this request
    entry.timestamps.push(now)
    next()
  }
}
