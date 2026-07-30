import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { logError } from "@/lib/logger"

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

// Periodic cleanup so the map doesn't grow unbounded over a long-running process.
const cleanupInterval = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}, 5 * 60 * 1000)
cleanupInterval.unref?.()

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
    : null

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp
  return "unknown"
}

function rateLimitMemory(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count++
  return { allowed: true, retryAfterSeconds: 0 }
}

async function rateLimitRedis(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const limiter = new Ratelimit({
    redis: redis!,
    limiter: Ratelimit.fixedWindow(limit, `${Math.max(1, Math.ceil(windowMs / 1000))} s`),
    prefix: "eventgrounds",
  })
  const result = await limiter.limit(key)
  return {
    allowed: result.success,
    retryAfterSeconds: result.success ? 0 : Math.max(0, Math.ceil((result.reset - Date.now()) / 1000)),
  }
}

/**
 * Fixed-window rate limiter. Backed by Upstash Redis when
 * UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN are set, so limits hold
 * across every instance of a multi-instance/serverless deployment. Falls
 * back to an in-memory counter (this process only) when those aren't
 * configured, or if Redis is unreachable - a soft ceiling rather than no
 * limiter at all, so a Redis outage can't be used to bypass rate limits by
 * accident, but also can't take down the routes that depend on this.
 */
export async function rateLimit(key: string, limit: number, windowMs: number): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  if (redis) {
    try {
      return await rateLimitRedis(key, limit, windowMs)
    } catch (error) {
      logError("rate-limit.redis", error, { key })
    }
  }
  return rateLimitMemory(key, limit, windowMs)
}
